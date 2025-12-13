import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse a UTC date string from the server into a proper Date object.
 * Server sends dates like "2025-12-12 20:29:18.395721" or "2025-12-12T20:29:18.395721"
 * without timezone indicator - these are always UTC.
 * @param utcDateString - Date string from server (UTC without Z suffix)
 * @returns Date object
 */
export function parseUtcDate(utcDateString: string): Date {
  if (!utcDateString) return new Date();

  // If the string already ends with Z or has timezone offset, parse directly
  if (utcDateString.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(utcDateString)) {
    return new Date(utcDateString);
  }

  // Replace space with T if needed for ISO format, then append Z for UTC
  const normalized = utcDateString.replace(' ', 'T');
  return new Date(normalized + 'Z');
}

/**
 * Format a UTC date string to user's local timezone
 * @param utcDateString - Date string from server (UTC)
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string in user's local timezone
 */
export function formatDateTime(
  utcDateString: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = parseUtcDate(utcDateString);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
}

/**
 * Format a UTC date string to user's local date only
 * @param utcDateString - Date string from server (UTC)
 * @returns Formatted date string in user's local timezone
 */
export function formatDate(utcDateString: string): string {
  const date = parseUtcDate(utcDateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a UTC date string to user's local time only
 * @param utcDateString - Date string from server (UTC)
 * @returns Formatted time string in user's local timezone
 */
export function formatTime(utcDateString: string): string {
  const date = parseUtcDate(utcDateString);
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get the user's timezone name (e.g., "America/New_York")
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Get a short timezone abbreviation (e.g., "EST", "PST")
 */
export function getTimezoneAbbreviation(): string {
  const date = new Date();
  const timeString = date.toLocaleTimeString('en-US', { timeZoneName: 'short' });
  const match = timeString.match(/[A-Z]{2,5}$/);
  return match ? match[0] : getUserTimezone();
}
