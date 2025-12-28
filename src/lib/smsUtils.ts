// GSM-7 character set (basic SMS characters)
// Standard GSM alphabet allows 160 chars per single segment, 153 for concatenated
// Unicode (UCS-2) allows 70 chars per single segment, 67 for concatenated

const GSM_BASIC_CHARSET = new Set([
  '@', '£', '$', '¥', 'è', 'é', 'ù', 'ì', 'ò', 'Ç', '\n', 'Ø', 'ø', '\r', 'Å', 'å',
  'Δ', '_', 'Φ', 'Γ', 'Λ', 'Ω', 'Π', 'Ψ', 'Σ', 'Θ', 'Ξ', '\x1B', 'Æ', 'æ', 'ß', 'É',
  ' ', '!', '"', '#', '¤', '%', '&', "'", '(', ')', '*', '+', ',', '-', '.', '/',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', ';', '<', '=', '>', '?',
  '¡', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
  'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'Ä', 'Ö', 'Ñ', 'Ü', '§',
  '¿', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
  'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'ä', 'ö', 'ñ', 'ü', 'à',
]);

// Extended GSM characters (count as 2 characters)
const GSM_EXTENDED_CHARSET = new Set(['^', '{', '}', '\\', '[', '~', ']', '|', '€']);

/**
 * Check if text can be encoded as GSM-7 (standard SMS encoding)
 */
export function isGsm7(text: string): boolean {
  for (const char of text) {
    if (!GSM_BASIC_CHARSET.has(char) && !GSM_EXTENDED_CHARSET.has(char)) {
      return false;
    }
  }
  return true;
}

/**
 * Calculate the GSM-7 character count (extended chars count as 2)
 */
export function getGsm7Length(text: string): number {
  let length = 0;
  for (const char of text) {
    if (GSM_EXTENDED_CHARSET.has(char)) {
      length += 2;
    } else {
      length += 1;
    }
  }
  return length;
}

/**
 * Count SMS segments for a given text
 * Returns the number of segments and the encoding type
 */
export function countSmsSegments(text: string): { segments: number; encoding: 'GSM-7' | 'UCS-2'; charCount: number; maxChars: number } {
  if (!text || text.length === 0) {
    return { segments: 0, encoding: 'GSM-7', charCount: 0, maxChars: 160 };
  }

  const isGsm = isGsm7(text);

  if (isGsm) {
    const charCount = getGsm7Length(text);
    // GSM-7: 160 chars for single SMS, 153 for concatenated
    if (charCount <= 160) {
      return { segments: 1, encoding: 'GSM-7', charCount, maxChars: 160 };
    }
    return {
      segments: Math.ceil(charCount / 153),
      encoding: 'GSM-7',
      charCount,
      maxChars: 153 * Math.ceil(charCount / 153)
    };
  } else {
    const charCount = text.length;
    // UCS-2: 70 chars for single SMS, 67 for concatenated
    if (charCount <= 70) {
      return { segments: 1, encoding: 'UCS-2', charCount, maxChars: 70 };
    }
    return {
      segments: Math.ceil(charCount / 67),
      encoding: 'UCS-2',
      charCount,
      maxChars: 67 * Math.ceil(charCount / 67)
    };
  }
}

/**
 * Format a phone number to E.164 format
 * @param phone - The phone number to format
 * @param defaultCountry - The default country code to use (default: 'US')
 */
export function formatPhoneE164(phone: string, defaultCountry = 'US'): string {
  // Remove all non-digit characters except leading +
  let cleaned = phone.replace(/[^\d+]/g, '');

  // If it already starts with +, assume it's already E.164
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // Remove leading zeros
  cleaned = cleaned.replace(/^0+/, '');

  // Add country code based on length and default country
  if (defaultCountry === 'US') {
    if (cleaned.length === 10) {
      // US 10-digit number
      return '+1' + cleaned;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      // US 11-digit with country code
      return '+' + cleaned;
    }
  }

  // If we can't determine the format, just add +
  return '+' + cleaned;
}

/**
 * Validate if a phone number is in E.164 format
 */
export function isValidE164(phone: string): boolean {
  // E.164 format: + followed by 1-15 digits
  return /^\+[1-9]\d{1,14}$/.test(phone);
}

/**
 * Format a phone number for display
 * @param phone - Phone number in E.164 format
 */
export function formatPhoneDisplay(phone: string): string {
  if (!phone) return '';

  // Remove non-digits
  const digits = phone.replace(/\D/g, '');

  // US number formatting
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // Return original for other formats
  return phone;
}

/**
 * Get the SMS status badge styling
 */
export function getSmsStatusStyle(statusText: string): string {
  const styles: Record<string, string> = {
    Sent: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20',
    Queued: 'bg-blue-500/15 text-blue-500 border-blue-500/20',
    Scheduled: 'bg-purple-500/15 text-purple-500 border-purple-500/20',
    Failed: 'bg-red-500/15 text-red-400 border-red-500/20',
  };
  return styles[statusText] || 'bg-muted text-muted-foreground';
}

/**
 * Extract variables from an SMS template body
 * Variables are in the format {{variable_name}}
 */
export function extractTemplateVariables(body: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const variables: string[] = [];
  let match;

  while ((match = regex.exec(body)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }

  return variables;
}

/**
 * Render an SMS template with variables
 */
export function renderTemplate(body: string, variables: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `{{${key}}}`);
}
