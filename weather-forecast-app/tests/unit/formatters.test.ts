/**
 * Unit tests for formatting utilities.
 * Requirements: 4.2, 4.3, 4.4
 */

import { describe, it, expect } from 'vitest';
import {
  formatTemperature,
  formatHumidity,
  formatPrecipitation,
} from '../../src/utils/formatters';

describe('formatTemperature (Requirement 4.2)', () => {
  it('formats a positive temperature to one decimal place with °C', () => {
    expect(formatTemperature(21.6)).toBe('21.6 °C');
  });

  it('formats a negative temperature correctly', () => {
    expect(formatTemperature(-5.3)).toBe('-5.3 °C');
  });

  it('rounds to one decimal place when needed', () => {
    expect(formatTemperature(20.05)).toBe('20.1 °C');
  });

  it('formats zero correctly', () => {
    expect(formatTemperature(0)).toBe('0.0 °C');
  });

  it('formats an integer with a trailing .0', () => {
    expect(formatTemperature(25)).toBe('25.0 °C');
  });

  it('formats a value that already has one decimal without adding extra zeros', () => {
    expect(formatTemperature(15.7)).toBe('15.7 °C');
  });
});

describe('formatHumidity (Requirement 4.3)', () => {
  it('rounds a whole-number humidity and appends %', () => {
    expect(formatHumidity(65)).toBe('65 %');
  });

  it('rounds a decimal humidity value', () => {
    expect(formatHumidity(64.7)).toBe('65 %');
  });

  it('rounds down correctly', () => {
    expect(formatHumidity(64.4)).toBe('64 %');
  });

  it('formats 0% humidity', () => {
    expect(formatHumidity(0)).toBe('0 %');
  });

  it('formats 100% humidity', () => {
    expect(formatHumidity(100)).toBe('100 %');
  });
});

describe('formatPrecipitation (Requirement 4.4)', () => {
  it('formats precipitation to one decimal place with mm', () => {
    expect(formatPrecipitation(1.2)).toBe('1.2 mm');
  });

  it('formats zero precipitation', () => {
    expect(formatPrecipitation(0)).toBe('0.0 mm');
  });

  it('formats a whole number with trailing .0', () => {
    expect(formatPrecipitation(3)).toBe('3.0 mm');
  });

  it('rounds to one decimal place', () => {
    // 2.16 unambiguously rounds to 2.2 via toFixed(1)
    expect(formatPrecipitation(2.16)).toBe('2.2 mm');
  });

  it('formats a larger precipitation value', () => {
    expect(formatPrecipitation(15.8)).toBe('15.8 mm');
  });
});
