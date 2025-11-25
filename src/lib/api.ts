import type {
  DomainResponse,
  MessageResponse,
  SendEmailResponse,
  CreateDomainRequest,
  SendEmailRequest,
  PaginatedResponse,
} from './types';
import { API_BASE_URL } from './config';

// Re-export for backward compatibility
export { API_BASE_URL };

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('authToken');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  return fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });
}

// Domain API
export const domainApi = {
  async create(data: CreateDomainRequest): Promise<DomainResponse> {
    const response = await fetchWithAuth('/api/v1/domains', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create domain');
    return response.json();
  },

  async getAll(): Promise<DomainResponse[]> {
    const response = await fetchWithAuth('/api/v1/domains');
    if (!response.ok) throw new Error('Failed to fetch domains');
    return response.json();
  },

  async getById(id: string): Promise<DomainResponse> {
    const response = await fetchWithAuth(`/api/v1/domains/${id}`);
    if (!response.ok) throw new Error('Failed to fetch domain');
    return response.json();
  },

  async verify(id: string): Promise<DomainResponse> {
    const response = await fetchWithAuth(`/api/v1/domains/${id}/verify`);
    if (!response.ok) throw new Error('Failed to verify domain');
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetchWithAuth(`/api/v1/domains/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete domain');
  },
};

// Email API
export const emailApi = {
  async send(data: SendEmailRequest): Promise<SendEmailResponse> {
    const response = await fetchWithAuth('/api/v1/emails/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send email');
    }
    return response.json();
  },
};

// Message API
export const messageApi = {
  async getAll(page: number = 1, pageSize: number = 50): Promise<PaginatedResponse<MessageResponse>> {
    const response = await fetchWithAuth(
      `/api/v1/messages?page=${page}&pageSize=${pageSize}`
    );
    if (!response.ok) throw new Error('Failed to fetch messages');
    const items = await response.json();

    // Since backend doesn't return pagination metadata, we create it here
    // In a real scenario, you'd want the backend to return totalCount
    return {
      items,
      totalCount: items.length, // This is a simplification - backend should return actual total
      page,
      pageSize,
    };
  },

  async getById(id: string): Promise<MessageResponse> {
    const response = await fetchWithAuth(`/api/v1/messages/${id}`);
    if (!response.ok) throw new Error('Failed to fetch message');
    return response.json();
  },
};
