import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Detect if text starts with RTL (Arabic/Persian/Hebrew) characters
 * @param text - The text to check
 * @returns true if the text starts with RTL characters
 */
export function isRTL(text: string): boolean {
  const rtlPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0590-\u05FF]/;
  return rtlPattern.test(text.trim().charAt(0));
}

/**
 * Get text direction based on content
 * @param text - The text to analyze
 * @returns "rtl" or "ltr"
 */
export function getTextDirection(text: string): "rtl" | "ltr" {
  return isRTL(text) ? "rtl" : "ltr";
}
