import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, notation?: "standard" | "compact", currency: "RON" | "EUR" = "RON"): string {
  const locale = getUserLocale();
  const numberLocale = locale === "ro" ? "ro-RO" : "en-US";
  return new Intl.NumberFormat(numberLocale, {
    style: "currency",
    currency: currency,
    notation: notation || "standard",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a number according to locale settings.
 * Handles thousands separators (.) and decimal comma (,).
 */
export const formatNumber = (value: number | null | undefined, notation?: "standard" | "compact"): string => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';

  const locale = getUserLocale();

  const numberLocale = locale === "ro" ? "ro-RO" : "en-GB";
  return new Intl.NumberFormat(numberLocale, {
    style: "decimal",
    notation: notation || "standard",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

export function generateHash(message: string): string {
  let hash = 0x811c9dc5; // FNV1a 32-bit offset basis

  for (let i = 0; i < message.length; i++) {
    hash ^= message.charCodeAt(i);
    // Math.imul performs a 32-bit integer multiplication.
    // This helps keep the hash within 32-bit integer behavior
    // and is efficient.
    hash = Math.imul(hash, 0x01000193); // FNV1a 32-bit prime
  }

  return Math.abs(hash).toString(16).padStart(8, '0');
}

export function capitalize(str: string) {
  return str.toLocaleLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export function convertDaysToMs(days: number): number {
  return days * 24 * 60 * 60 * 1000;
}

/**
 * Converts input into a URL-friendly slug.
 * Lowercases, trims, replaces non-alphanumerics with dashes, and collapses repeats.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function getUserLocale(): string {
  const savedLocale = typeof window !== 'undefined' ? window.localStorage.getItem('user-locale') : null;
  const browserLocale = typeof navigator !== 'undefined' ? navigator.language : 'en';
  const initialLocale = savedLocale || (browserLocale?.toLowerCase().startsWith('ro') ? 'ro' : 'en');
  return initialLocale;
}

export function setUserLocale(locale: string): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('user-locale', locale);
  }
}