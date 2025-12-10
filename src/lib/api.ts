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
  TenantRole,
  TenantMemberResponse,
  TenantInvitationResponse,
  TenantResponse,
  TemplateResponse,
  TemplateListResponse,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  RenderedTemplate,
  SendBatchEmailRequest,
  BatchEmailResponse,
  ListEmailsParams,
  EmailListResponse,
  UpdateScheduledEmailRequest,
  AttachmentResponse,
  AttachmentDownloadResponse,
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

// Current tenant ID for API requests
let currentTenantId: string | null = null;

export function setCurrentTenantId(tenantId: string | null) {
  currentTenantId = tenantId;
}

export function getCurrentTenantId(): string | null {
  return currentTenantId;
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(currentTenantId && { 'X-Tenant-Id': currentTenantId }),
    ...options.headers as Record<string, string>,
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

  async sendBatch(data: SendBatchEmailRequest): Promise<BatchEmailResponse> {
    const response = await fetchWithAuth('/api/v1/emails/batch', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send batch emails');
    }
    return response.json();
  },

  async list(params: ListEmailsParams = {}): Promise<EmailListResponse> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.page_size) queryParams.set('page_size', params.page_size.toString());
    if (params.status !== undefined) queryParams.set('status', params.status.toString());
    if (params.from_email) queryParams.set('from_email', params.from_email);
    if (params.to_email) queryParams.set('to_email', params.to_email);
    if (params.since) queryParams.set('since', params.since);
    if (params.until) queryParams.set('until', params.until);
    if (params.sort_by) queryParams.set('sort_by', params.sort_by);
    if (params.sort_order) queryParams.set('sort_order', params.sort_order);

    const queryString = queryParams.toString();
    const url = `/api/v1/emails${queryString ? `?${queryString}` : ''}`;

    const response = await fetchWithAuth(url);
    if (!response.ok) throw new Error('Failed to list emails');
    return response.json();
  },

  async getById(id: string): Promise<MessageResponse> {
    const response = await fetchWithAuth(`/api/v1/emails/${id}`);
    if (!response.ok) throw new Error('Failed to fetch email');
    return response.json();
  },

  async update(id: string, data: UpdateScheduledEmailRequest): Promise<MessageResponse> {
    const response = await fetchWithAuth(`/api/v1/emails/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update email');
    }
    return response.json();
  },

  async cancel(id: string): Promise<{ message: string }> {
    const response = await fetchWithAuth(`/api/v1/emails/${id}/cancel`, {
      method: 'POST',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to cancel email');
    }
    return response.json();
  },

  async listAttachments(emailId: string): Promise<AttachmentResponse[]> {
    const response = await fetchWithAuth(`/api/v1/emails/${emailId}/attachments`);
    if (!response.ok) throw new Error('Failed to list attachments');
    return response.json();
  },

  async getAttachmentUrl(emailId: string, attachmentId: number): Promise<AttachmentDownloadResponse> {
    const response = await fetchWithAuth(`/api/v1/emails/${emailId}/attachments/${attachmentId}`);
    if (!response.ok) throw new Error('Failed to get attachment URL');
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
  async initialize(preferredTenantId?: string): Promise<InitializeUserResponse> {
    const response = await fetchWithAuth('/api/entraauth/initialize', {
      method: 'POST',
      body: JSON.stringify(preferredTenantId ? { preferredTenantId } : {}),
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

// Tenants API
export const tenantsApi = {
  async getAll(): Promise<TenantResponse[]> {
    const response = await fetchWithAuth('/api/tenants');
    if (!response.ok) throw new Error('Failed to fetch tenants');
    return response.json();
  },

  async getById(tenantId: string): Promise<TenantResponse> {
    const response = await fetchWithAuth(`/api/tenants/${tenantId}`);
    if (!response.ok) throw new Error('Failed to fetch tenant');
    return response.json();
  },

  async create(name: string): Promise<TenantResponse> {
    const response = await fetchWithAuth('/api/tenants', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create tenant');
    }
    return response.json();
  },

  async update(tenantId: string, name: string): Promise<TenantResponse> {
    const response = await fetchWithAuth(`/api/tenants/${tenantId}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update tenant');
    }
    return response.json();
  },

  async delete(tenantId: string): Promise<void> {
    const response = await fetchWithAuth(`/api/tenants/${tenantId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete tenant');
    }
  },

  // Members
  async getMembers(tenantId: string): Promise<TenantMemberResponse[]> {
    const response = await fetchWithAuth(`/api/tenants/${tenantId}/members`);
    if (!response.ok) throw new Error('Failed to fetch members');
    return response.json();
  },

  async removeMember(tenantId: string, userId: string): Promise<void> {
    const response = await fetchWithAuth(`/api/tenants/${tenantId}/members/${userId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to remove member');
  },

  async updateMemberRole(tenantId: string, userId: string, role: TenantRole): Promise<TenantMemberResponse> {
    const response = await fetchWithAuth(`/api/tenants/${tenantId}/members/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify(role),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update member role');
    }
    return response.json();
  },

  // Invitations
  async sendInvitation(tenantId: string, email: string, role: TenantRole): Promise<TenantInvitationResponse> {
    const response = await fetchWithAuth(`/api/tenants/${tenantId}/invitations`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send invitation');
    }
    return response.json();
  },

  async getPendingInvitations(tenantId: string): Promise<TenantInvitationResponse[]> {
    const response = await fetchWithAuth(`/api/tenants/${tenantId}/invitations`);
    if (!response.ok) throw new Error('Failed to fetch invitations');
    return response.json();
  },

  async revokeInvitation(invitationId: string): Promise<void> {
    const response = await fetchWithAuth(`/api/tenants/invitations/${invitationId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to revoke invitation');
  },

  async getInvitationByToken(token: string): Promise<TenantInvitationResponse | null> {
    const response = await fetchWithAuth(`/api/tenants/invitations/token/${encodeURIComponent(token)}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Failed to fetch invitation');
    return response.json();
  },

  async acceptInvitation(token: string): Promise<TenantResponse> {
    const response = await fetchWithAuth(`/api/tenants/invitations/token/${encodeURIComponent(token)}/accept`, {
      method: 'POST',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to accept invitation');
    }
    return response.json();
  },
};

// Contact API (public endpoint)
export interface ContactRequest {
  email: string;
  message: string;
}

export const contactApi = {
  async submit(data: ContactRequest): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Too many requests. Please wait a few minutes before trying again.');
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to send message');
    }
    return response.json();
  },
};

// Template API
export const templateApi = {
  async getAll(): Promise<TemplateListResponse[]> {
    const response = await fetchWithAuth('/api/v1/templates');
    if (!response.ok) throw new Error('Failed to fetch templates');
    return response.json();
  },

  async getById(id: string): Promise<TemplateResponse> {
    const response = await fetchWithAuth(`/api/v1/templates/${id}`);
    if (!response.ok) throw new Error('Failed to fetch template');
    return response.json();
  },

  async create(data: CreateTemplateRequest): Promise<TemplateResponse> {
    const response = await fetchWithAuth('/api/v1/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create template');
    }
    return response.json();
  },

  async update(id: string, data: UpdateTemplateRequest): Promise<TemplateResponse> {
    const response = await fetchWithAuth(`/api/v1/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update template');
    }
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetchWithAuth(`/api/v1/templates/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete template');
  },

  async preview(id: string, variables?: Record<string, string>): Promise<RenderedTemplate> {
    const response = await fetchWithAuth(`/api/v1/templates/${id}/preview`, {
      method: 'POST',
      body: JSON.stringify(variables || {}),
    });
    if (!response.ok) throw new Error('Failed to preview template');
    return response.json();
  },
};
