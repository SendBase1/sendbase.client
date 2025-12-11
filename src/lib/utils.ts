import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a UTC date string to user's local timezone
 * @param utcDateString - ISO date string in UTC (e.g., "2024-01-15T10:30:00Z")
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string in user's local timezone
 */
export function formatDateTime(
  utcDateString: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(utcDateString);
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
 * @param utcDateString - ISO date string in UTC
 * @returns Formatted date string in user's local timezone
 */
export function formatDate(utcDateString: string): string {
  const date = new Date(utcDateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a UTC date string to user's local time only
 * @param utcDateString - ISO date string in UTC
 * @returns Formatted time string in user's local timezone
 */
export function formatTime(utcDateString: string): string {
  const date = new Date(utcDateString);
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
