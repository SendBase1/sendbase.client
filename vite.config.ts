import { fileURLToPath, URL } from 'node:url';

import { defineConfig, type ServerOptions } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import { env } from 'process';

const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
    env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'https://localhost:7220';

// Setup certificates for HTTPS in development
function getServerConfig(): ServerOptions | undefined {
    // Only setup certificates when running dev server (not during build)
    const baseFolder =
        env.APPDATA !== undefined && env.APPDATA !== ''
            ? `${env.APPDATA}/ASP.NET/https`
            : `${env.HOME}/.aspnet/https`;

    const certificateName = "email.client";
    const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
    const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

    // Check if certs exist, if not try to create them
    if (!fs.existsSync(baseFolder)) {
        fs.mkdirSync(baseFolder, { recursive: true });
    }

    if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
        const result = child_process.spawnSync('dotnet', [
            'dev-certs',
            'https',
            '--export-path',
            certFilePath,
            '--format',
            'Pem',
            '--no-password',
        ], { stdio: 'inherit' });

        if (result.status !== 0) {
            console.warn("Could not create certificate, falling back to HTTP");
            return {
                proxy: {
                    '^/weatherforecast': { target, secure: false },
                    '^/api': { target, secure: false }
                },
                port: parseInt(env.DEV_SERVER_PORT || '59592'),
            };
        }
    }

    return {
        proxy: {
            '^/weatherforecast': { target, secure: false },
            '^/api': { target, secure: false }
        },
        port: parseInt(env.DEV_SERVER_PORT || '59592'),
        https: {
            key: fs.readFileSync(keyFilePath),
            cert: fs.readFileSync(certFilePath),
        },
    };
}

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
    appType: 'spa',
    plugins: [react()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    build: {
        chunkSizeWarningLimit: 700, // Syntax highlighter is ~637KB, isolated to landing page only
        rollupOptions: {
            output: {
                manualChunks: {
                    // Vendor chunks - split large dependencies
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-tabs', '@radix-ui/react-tooltip', '@radix-ui/react-switch', '@radix-ui/react-separator', '@radix-ui/react-label', '@radix-ui/react-slot'],
                    'vendor-query': ['@tanstack/react-query'],
                    'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
                    'vendor-utils': ['clsx', 'tailwind-merge', 'class-variance-authority', 'date-fns', 'lucide-react'],
                    'vendor-syntax': ['react-syntax-highlighter'],
                }
            }
        }
    },
    // Server config only needed for dev command
    server: command === 'serve' ? getServerConfig() : undefined,
    // Preview server config (for npm run preview)
    preview: {
        port: parseInt(env.DEV_SERVER_PORT || '59592'),
    }
}))
