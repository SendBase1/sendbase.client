// API Response Types

export interface DomainResponse {
  id: string;
  domain: string;
  region: string;
  verification_status: number;
  verification_status_text: string;
  dkim_status: number;
  dkim_status_text: string;
  mail_from_status: number;
  mail_from_subdomain?: string;
  identity_arn?: string;
  created_at_utc: string;
  verified_at_utc?: string;
  dns_records: DnsRecordResponse[];
}

export interface DnsRecordResponse {
  id: number;
  record_type: string;
  host: string;
  value: string;
  required: boolean;
  last_checked_utc?: string;
  status: number;
  status_text: string;
}

export interface MessageResponse {
  id: string;
  from_email: string;
  from_name?: string;
  subject?: string;
  ses_message_id?: string;
  status: number;
  status_text: string;
  requested_at_utc: string;
  sent_at_utc?: string;
  error?: string;
  recipients: MessageRecipientResponse[];
  events: MessageEventResponse[];
  tags: Record<string, string>;
}

export interface MessageRecipientResponse {
  id: number;
  kind: number;
  kind_text: string;
  email: string;
  name?: string;
  delivery_status: number;
  delivery_status_text: string;
  ses_delivery_id?: string;
}

export interface MessageEventResponse {
  id: number;
  event_type: string;
  occurred_at_utc: string;
  recipient?: string;
}

export interface SendEmailResponse {
  message_id: string;
  ses_message_id?: string;
  status: number;
  status_text: string;
  requested_at_utc: string;
  scheduled_at_utc?: string;
  error?: string;
}

// API Request Types

export interface CreateDomainRequest {
  domain: string;
  region: string;
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendEmailRequest {
  from_email: string;
  from_name?: string;
  to: EmailRecipient[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  subject: string;
  html_body?: string;
  text_body?: string;
  tags?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total_count: number;
  page: number;
  page_size: number;
}

// API Key Types

export interface ApiKeyResponse {
  id: string;
  name: string;
  key?: string;  // Only present on create response
  key_preview: string;
  scopes: string[];
  domain_id: string;
  domain_name: string;
  created_at_utc: string;
  last_used_at_utc: string | null;
  is_revoked?: boolean;
}

export interface CreateApiKeyRequest {
  name: string;
  domain_id: string;
  scopes: string[];
}

export interface ApiKeyScope {
  name: string;
  description: string;
}

export interface ApiKeyPreset {
  name: string;
  label: string;
  description: string;
  scopes: string[];
}

export interface ApiKeyScopesResponse {
  scopes: ApiKeyScope[];
  presets: ApiKeyPreset[];
}

// Webhook Types

export interface WebhookEndpointResponse {
  id: string;
  name: string;
  url: string;
  event_types: string[];
  enabled: boolean;
  secret_preview: string;
  created_at_utc: string;
}

export interface WebhookEndpointCreatedResponse {
  endpoint: WebhookEndpointResponse;
  secret: string;
}

export interface CreateWebhookEndpointRequest {
  name: string;
  url: string;
  event_types: string[];
}

export interface UpdateWebhookEndpointRequest {
  name?: string;
  url?: string;
  event_types?: string[];
  enabled?: boolean;
}

export interface WebhookEventType {
  name: string;
  description: string;
}

export interface WebhookDeliveryResponse {
  id: number;
  event_type: string;
  status: number;
  status_text: string;
  attempt_count: number;
  last_attempt_utc?: string;
  response_status_code?: number;
  next_retry_at_utc?: string;
}

export interface WebhookTestResponse {
  success: boolean;
  message: string;
  status_code?: number;
}

// Billing Types

export interface BillingPlanResponse {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  monthlyPriceCents: number;
  includedEmails: number;
  overageRateCentsPer1K: number;
  allowsOverage: boolean;
  maxDomains: number;
  maxApiKeys: number;
  maxWebhooks: number;
  maxTeamMembers: number;
  maxTemplates: number;
  analyticsRetentionDays: number;
  hasDedicatedIp: boolean;
  supportLevel: string;
  stripePaymentLinkUrl?: string;
}

export interface SubscriptionResponse {
  id: string;
  plan: BillingPlanResponse;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
}

export interface UsageSummaryResponse {
  currentPeriodStart: string;
  currentPeriodEnd: string;
  emailsSent: number;
  emailsIncluded: number;
  emailsRemaining: number;
  overageEmails: number;
  estimatedOverageCostCents: number;
  usagePercentage: number;
  daysRemainingInPeriod: number;
}

export interface InvoiceResponse {
  id: string;
  stripeInvoiceId: string;
  amountDueCents: number;
  amountPaidCents: number;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  status: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  paidAt?: string;
  hostedInvoiceUrl?: string;
  invoicePdf?: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  checkoutUrl: string;
}

export interface CustomerPortalResponse {
  portalUrl: string;
}

export interface PlanLimitsResponse {
  maxDomains: number;
  maxApiKeys: number;
  maxWebhookEndpoints: number;
  maxTeamMembers: number;
  currentDomains: number;
  currentApiKeys: number;
  currentWebhookEndpoints: number;
  currentTeamMembers: number;
  canAddDomain: boolean;
  canAddApiKey: boolean;
  canAddWebhookEndpoint: boolean;
  canAddTeamMember: boolean;
}

// Billing Request Types

export interface CreateCheckoutRequest {
  planId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface ChangePlanRequest {
  newPlanId: string;
}

export interface CreatePortalSessionRequest {
  returnUrl: string;
}

export interface CancelSubscriptionRequest {
  cancelImmediately: boolean;
}
