/**
 * Formatting utilities for weather data display.
 * Transformations (rounding, units) are applied here in the UI layer,
 * preserving raw numeric fidelity in the data layer.
 */

/**
 * Formats a temperature value to one decimal place with the °C unit.
 * Requirements: 4.2
 */
export function formatTemperature(t: number): string {
  return Number(t).toFixed(1) + " °C";
}

/**
 * Formats a relative humidity value as a whole-number percentage.
 * Requirements: 4.3
 */
export function formatHumidity(h: number): string {
  return Math.round(h) + " %";
}

/**
 * Formats a precipitation value to one decimal place with the mm unit.
 * Requirements: 4.4
 */
export function formatPrecipitation(p: number): string {
  return Number(p).toFixed(1) + " mm";
}
