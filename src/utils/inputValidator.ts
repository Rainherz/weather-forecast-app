import { WeatherError } from '../types/index.ts';

/**
 * Validates a raw city name string entered by the user.
 *
 * Rules (Requirements 1.3 – 1.7):
 * - Empty string or whitespace-only → INVALID_INPUT / EMPTY
 * - Post-trim length > 100 chars    → INVALID_INPUT / TOO_LONG
 * - 1–100 chars after trim          → valid, returns trimmed value
 *
 * @param raw The raw string from the City_Input field.
 * @returns   A discriminated union: valid with trimmed string, or invalid with a WeatherError.
 */
export function validateCityInput(
  raw: string,
): { valid: true; trimmed: string } | { valid: false; error: WeatherError } {
  const trimmed = raw.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: { kind: 'INVALID_INPUT', reason: 'EMPTY' } };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: { kind: 'INVALID_INPUT', reason: 'TOO_LONG' } };
  }

  return { valid: true, trimmed };
}
