import type {
  DomainResponse,
  MessageResponse,
  SendEmailResponse,
  CreateDomainRequest,
  SendEmailRequest,
  PaginatedResponse,
  ApiKeyResponse,
  CreateApiKeyRequest,
  ApiKeyScopesResponse,
  WebhookEndpointResponse,
  WebhookEndpointCreatedResponse,
  CreateWebhookEndpointRequest,
  UpdateWebhookEndpointRequest,
  WebhookEventType,
  WebhookDeliveryResponse,
  WebhookTestResponse,
  BillingPlanResponse,
  SubscriptionResponse,
  UsageSummaryResponse,
  InvoiceResponse,
  CheckoutSessionResponse,
  CustomerPortalResponse,
  PlanLimitsResponse,
  CreateCheckoutRequest,
  ChangePlanRequest,
  CreatePortalSessionRequest,
  CancelSubscriptionRequest,
} from './types';
import { API_BASE_URL } from './config';
import { triggerLogout } from '../contexts/AuthContext';
import { msalInstance, loginRequest } from './authConfig';

// Re-export for backward compatibility
export { API_BASE_URL };

// Types for Entra auth
export interface InitializeUserResponse {
  userId: string;
  email: string | null;
  name: string | null;
  tenantId: string;
  isNewUser: boolean;
  availableTenants: TenantInfo[];
}

export interface TenantInfo {
  id: string;
  name: string;
}

export interface UserInfo {
  userId: string;
  email: string | null;
  name: string | null;
  tenantId: string | null;
  availableTenants: TenantInfo[];
  emailConfirmed: boolean;
}

// Get access token from MSAL
async function getAccessToken(): Promise<string | null> {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) return null;

  try {
    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: accounts[0],
    });
    // For CIAM with openid scopes, we get an ID token
    // Log token info for debugging (without exposing the actual token)
    if (response.idToken) {
      console.log('[API] Got ID token, expires:', response.expiresOn);
    }
    // Use idToken for authentication with our backend since we're using CIAM openid scopes
    return response.idToken || response.accessToken;
  } catch (error) {
    console.error('Failed to acquire token silently:', error);
    return null;
  }
}

// Flag to prevent logout during initialization
let isInitializing = false;

export function setInitializing(value: boolean) {
  isInitializing = value;
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await getAccessToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized - trigger logout (but not during initialization)
  if (response.status === 401 && !isInitializing) {
    triggerLogout();
    throw new Error('Session expired. Please log in again.');
  }

  return response;
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
    // In a real scenario, you'd want the backend to return total_count
    return {
      items,
      total_count: items.length, // This is a simplification - backend should return actual total
      page,
      page_size: pageSize,
    };
  },

  async getById(id: string): Promise<MessageResponse> {
    const response = await fetchWithAuth(`/api/v1/messages/${id}`);
    if (!response.ok) throw new Error('Failed to fetch message');
    return response.json();
  },
};

// API Key API
export const apiKeyApi = {
  async getAll(): Promise<ApiKeyResponse[]> {
    const response = await fetchWithAuth('/api/v1/apikeys');
    if (!response.ok) throw new Error('Failed to fetch API keys');
    return response.json();
  },

  async create(data: CreateApiKeyRequest): Promise<ApiKeyResponse> {
    const response = await fetchWithAuth('/api/v1/apikeys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create API key');
    }
    return response.json();
  },

  async revoke(id: string): Promise<void> {
    const response = await fetchWithAuth(`/api/v1/apikeys/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to revoke API key');
  },

  async getScopes(): Promise<ApiKeyScopesResponse> {
    const response = await fetchWithAuth('/api/v1/apikeys/scopes');
    if (!response.ok) throw new Error('Failed to fetch scopes');
    return response.json();
  },
};

// Webhook API
export const webhookApi = {
  async getAll(): Promise<WebhookEndpointResponse[]> {
    const response = await fetchWithAuth('/api/v1/webhook-endpoints');
    if (!response.ok) throw new Error('Failed to fetch webhooks');
    return response.json();
  },

  async getById(id: string): Promise<WebhookEndpointResponse> {
    const response = await fetchWithAuth(`/api/v1/webhook-endpoints/${id}`);
    if (!response.ok) throw new Error('Failed to fetch webhook');
    return response.json();
  },

  async create(data: CreateWebhookEndpointRequest): Promise<WebhookEndpointCreatedResponse> {
    const response = await fetchWithAuth('/api/v1/webhook-endpoints', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create webhook');
    }
    return response.json();
  },

  async update(id: string, data: UpdateWebhookEndpointRequest): Promise<WebhookEndpointResponse> {
    const response = await fetchWithAuth(`/api/v1/webhook-endpoints/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update webhook');
    }
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetchWithAuth(`/api/v1/webhook-endpoints/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete webhook');
  },

  async test(id: string): Promise<WebhookTestResponse> {
    const response = await fetchWithAuth(`/api/v1/webhook-endpoints/${id}/test`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to test webhook');
    return response.json();
  },

  async getDeliveries(id: string, limit: number = 50): Promise<WebhookDeliveryResponse[]> {
    const response = await fetchWithAuth(`/api/v1/webhook-endpoints/${id}/deliveries?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch deliveries');
    return response.json();
  },

  async getEventTypes(): Promise<WebhookEventType[]> {
    const response = await fetchWithAuth('/api/v1/webhook-endpoints/event-types');
    if (!response.ok) throw new Error('Failed to fetch event types');
    return response.json();
  },
};

// Billing API
export const billingApi = {
  async getPlans(): Promise<BillingPlanResponse[]> {
    const response = await fetchWithAuth('/api/v1/billing/plans');
    if (!response.ok) throw new Error('Failed to fetch billing plans');
    return response.json();
  },

  async getSubscription(): Promise<SubscriptionResponse | null> {
    const response = await fetchWithAuth('/api/v1/billing/subscription');
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Failed to fetch subscription');
    return response.json();
  },

  async getUsage(): Promise<UsageSummaryResponse> {
    const response = await fetchWithAuth('/api/v1/billing/usage');
    if (!response.ok) throw new Error('Failed to fetch usage');
    return response.json();
  },

  async getInvoices(): Promise<InvoiceResponse[]> {
    const response = await fetchWithAuth('/api/v1/billing/invoices');
    if (!response.ok) throw new Error('Failed to fetch invoices');
    return response.json();
  },

  async getLimits(): Promise<PlanLimitsResponse> {
    const response = await fetchWithAuth('/api/v1/billing/limits');
    if (!response.ok) throw new Error('Failed to fetch plan limits');
    return response.json();
  },

  async createCheckoutSession(data: CreateCheckoutRequest): Promise<CheckoutSessionResponse> {
    const response = await fetchWithAuth('/api/v1/billing/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create checkout session');
    }
    return response.json();
  },

  async changePlan(data: ChangePlanRequest): Promise<SubscriptionResponse> {
    const response = await fetchWithAuth('/api/v1/billing/subscription/change-plan', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to change plan');
    }
    return response.json();
  },

  async cancelSubscription(data: CancelSubscriptionRequest): Promise<SubscriptionResponse> {
    const response = await fetchWithAuth('/api/v1/billing/subscription/cancel', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cancel subscription');
    }
    return response.json();
  },

  async reactivateSubscription(): Promise<SubscriptionResponse> {
    const response = await fetchWithAuth('/api/v1/billing/subscription/reactivate', {
      method: 'POST',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reactivate subscription');
    }
    return response.json();
  },

  async createPortalSession(data: CreatePortalSessionRequest): Promise<CustomerPortalResponse> {
    const response = await fetchWithAuth('/api/v1/billing/portal', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create portal session');
    }
    return response.json();
  },
};

// Entra Auth API
export const entraAuthApi = {
  async initialize(): Promise<InitializeUserResponse> {
    const response = await fetchWithAuth('/api/entraauth/initialize', {
      method: 'POST',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to initialize user');
    }
    return response.json();
  },

  async getMe(): Promise<UserInfo> {
    const response = await fetchWithAuth('/api/entraauth/me');
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get user info');
    }
    return response.json();
  },

  async switchTenant(tenantId: string): Promise<{ tenantId: string; tenantName: string; availableTenants: TenantInfo[] }> {
    const response = await fetchWithAuth('/api/entraauth/switch-tenant', {
      method: 'POST',
      body: JSON.stringify({ tenantId }),
    });
    if (!response.ok) {
      throw new Error('Failed to switch tenant');
    }
    return response.json();
  },
};
