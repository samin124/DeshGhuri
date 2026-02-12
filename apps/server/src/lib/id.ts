import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 16);

/**
 * Generate a unique ID with a prefix
 * @param prefix - The prefix for the ID (e.g., 'user', 'seller', 'role')
 * @returns A unique ID with the format: prefix_randomString
 */
export function generateId(prefix: string): string {
  return `${prefix}_${nanoid()}`;
}
