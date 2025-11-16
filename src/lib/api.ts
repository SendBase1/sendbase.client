// API configuration
// The Vite dev server proxies API requests to the backend
// In development: proxies to https://localhost:7220
// In production: you would set this to your deployed API URL

export const API_BASE_URL = import.meta.env.PROD
    ? 'https://localhost:7220' // Change this to your production API URL
    : ''; // Empty string uses the proxy in vite.config.ts

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('authToken');

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    return fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
    });
}
