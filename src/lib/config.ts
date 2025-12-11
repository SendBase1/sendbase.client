/**
 * Application Configuration
 * Centralized configuration for all URLs, API endpoints, and app settings
 */

// API Configuration
export const config = {
  // Base API URL - configured via environment variable
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7220',

  // App domain (for marketing site examples, etc.)
  appDomain: import.meta.env.VITE_APP_DOMAIN || 'sendbase.app',

  // Feature flags
  features: {
    enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  },

  // API endpoints
  api: {
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
    },
    domains: '/api/v1/domains',
    emails: '/api/v1/emails',
    messages: '/api/v1/messages',
  },
} as const;

// Helper to get full API URL
export function getApiUrl(path: string): string {
  return `${config.apiBaseUrl}${path}`;
}

// Export API_BASE_URL for backward compatibility
export const API_BASE_URL = config.apiBaseUrl;
