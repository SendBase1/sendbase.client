import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from './components/ui/sonner'
import './index.css'
import App from './App.tsx'
import { initializeMsal } from './lib/authConfig'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Show branded loading screen while MSAL initializes
function showInitialLoader() {
  const root = document.getElementById('root')!
  root.innerHTML = `
    <div style="
      position: fixed;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: hsl(0 0% 3.9%);
      color: hsl(0 0% 98%);
      font-family: 'Inter', system-ui, sans-serif;
    ">
      <div style="
        display: flex;
        height: 80px;
        width: 80px;
        align-items: center;
        justify-content: center;
        border-radius: 16px;
        background: hsl(0 0% 3.9%);
        border: 1px solid hsl(0 0% 14.9%);
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        margin-bottom: 32px;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="20" height="16" x="2" y="4" rx="2"/>
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
        </svg>
      </div>
      <div style="
        position: relative;
        height: 48px;
        width: 48px;
        margin-bottom: 32px;
      ">
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid hsl(0 0% 14.9%);
        "></div>
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid transparent;
          border-top-color: hsl(0 0% 98%);
          animation: spin 1s linear infinite;
        "></div>
      </div>
      <style>
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    </div>
  `
}

// Show loader immediately
showInitialLoader()

// Initialize MSAL before rendering the app
initializeMsal().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster position="bottom-right" richColors />
      </QueryClientProvider>
    </StrictMode>,
  )
}).catch((error) => {
  console.error('Failed to initialize MSAL:', error)
  // Render app anyway, but auth won't work
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster position="bottom-right" richColors />
      </QueryClientProvider>
    </StrictMode>,
  )
})
