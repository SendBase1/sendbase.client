// API Response Types

export interface DomainResponse {
  id: string;
  domain: string;
  region: string;
  verificationStatus: number;
  verificationStatusText: string;
  dkimStatus: number;
  dkimStatusText: string;
  mailFromStatus: number;
  mailFromSubdomain?: string;
  identityArn?: string;
  createdAtUtc: string;
  verifiedAtUtc?: string;
  dnsRecords: DnsRecordResponse[];
}

export interface DnsRecordResponse {
  id: number;
  recordType: string;
  host: string;
  value: string;
  required: boolean;
  lastCheckedUtc?: string;
  status: number;
  statusText: string;
}

export interface MessageResponse {
  id: string;
  fromEmail: string;
  fromName?: string;
  subject?: string;
  sesMessageId?: string;
  status: number;
  statusText: string;
  requestedAtUtc: string;
  sentAtUtc?: string;
  error?: string;
  recipients: MessageRecipientResponse[];
  events: MessageEventResponse[];
  tags: Record<string, string>;
}

export interface MessageRecipientResponse {
  id: number;
  kind: number;
  kindText: string;
  email: string;
  name?: string;
  deliveryStatus: number;
  deliveryStatusText: string;
  sesDeliveryId?: string;
}

export interface MessageEventResponse {
  id: number;
  eventType: string;
  occurredAtUtc: string;
  recipient?: string;
}

export interface SendEmailResponse {
  messageId: string;
  sesMessageId?: string;
  status: number;
  statusText: string;
  requestedAtUtc: string;
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
  fromEmail: string;
  fromName?: string;
  to: EmailRecipient[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  subject: string;
  htmlBody?: string;
  textBody?: string;
  tags?: Record<string, string>;
  configSetId?: string;
  templateId?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
