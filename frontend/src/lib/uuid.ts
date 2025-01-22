/**
 * UUID Generation Helper
 * 
 * Provides a consistent way to generate UUIDs across the application
 * with fallback for environments without crypto.randomUUID
 */

/**
 * Generates a UUID v4
 * Falls back to a pseudo-random implementation if crypto.randomUUID is not available
 */
export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}; 