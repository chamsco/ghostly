/**
 * Utility Functions
 * 
 * Common utility functions used across the application:
 * - cn: Merges class names with Tailwind CSS
 */
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines multiple class names into a single string, merging Tailwind classes intelligently.
 * Uses clsx for conditional class names and tailwind-merge to handle conflicting Tailwind classes.
 * 
 * @param inputs - Array of class names, objects, or falsy values
 * @returns Merged class string with resolved Tailwind conflicts
 * 
 * @example
 * cn('px-2 py-1', condition && 'bg-blue-500', 'hover:bg-blue-600')
 * // Returns: "px-2 py-1 bg-blue-500 hover:bg-blue-600" if condition is true
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
} 