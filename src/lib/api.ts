// API configuration
// The API base URL is configured via environment variables
// See .env.local for development and .env.production for production

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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
