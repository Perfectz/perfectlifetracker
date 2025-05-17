// backend/src/utils/validators.ts
// Validation utility functions

/**
 * Custom validator for date formats
 * @param value Date string to validate
 * @returns true if valid, false otherwise
 */
export function validateDate(value: string): boolean {
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Custom validator for optional date formats
 * @param value Date string to validate or undefined
 * @returns true if valid or undefined, false otherwise
 */
export function validateOptionalDate(value?: string): boolean {
  if (!value) return true;
  return validateDate(value);
}

/**
 * Validates that a value is within a numeric range
 * @param value Number to validate
 * @param min Minimum value (inclusive)
 * @param max Maximum value (inclusive)
 * @returns true if within range, false otherwise
 */
export function validateRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Validates that a string is not empty
 * @param value String to validate
 * @returns true if not empty, false otherwise
 */
export function validateNotEmpty(value?: string): boolean {
  return !!value && value.trim().length > 0;
}

/**
 * Validates that a value is a valid email
 * @param value Email to validate
 * @returns true if valid email, false otherwise
 */
export function validateEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
} 