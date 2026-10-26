/**
 * Unit tests for validateCityInput utility.
 * Requirements: 1.3, 1.4, 1.5, 1.6, 1.7
 */

import { describe, it, expect } from 'vitest';
import { validateCityInput } from '../../src/utils/inputValidator';

describe('validateCityInput', () => {
  describe('EMPTY cases (Requirement 1.3, 1.4)', () => {
    it('returns INVALID_INPUT/EMPTY for an empty string', () => {
      const result = validateCityInput('');
      expect(result).toEqual({ valid: false, error: { kind: 'INVALID_INPUT', reason: 'EMPTY' } });
    });

    it('returns INVALID_INPUT/EMPTY for a string of only spaces', () => {
      const result = validateCityInput('   ');
      expect(result).toEqual({ valid: false, error: { kind: 'INVALID_INPUT', reason: 'EMPTY' } });
    });

    it('returns INVALID_INPUT/EMPTY for a tab character', () => {
      const result = validateCityInput('\t');
      expect(result).toEqual({ valid: false, error: { kind: 'INVALID_INPUT', reason: 'EMPTY' } });
    });

    it('returns INVALID_INPUT/EMPTY for a newline character', () => {
      const result = validateCityInput('\n');
      expect(result).toEqual({ valid: false, error: { kind: 'INVALID_INPUT', reason: 'EMPTY' } });
    });
  });

  describe('TOO_LONG cases (Requirement 1.6)', () => {
    it('returns INVALID_INPUT/TOO_LONG for a 101-character string', () => {
      const input = 'a'.repeat(101);
      const result = validateCityInput(input);
      expect(result).toEqual({ valid: false, error: { kind: 'INVALID_INPUT', reason: 'TOO_LONG' } });
    });

    it('returns INVALID_INPUT/TOO_LONG for a string with 200 characters', () => {
      const input = 'x'.repeat(200);
      const result = validateCityInput(input);
      expect(result).toEqual({ valid: false, error: { kind: 'INVALID_INPUT', reason: 'TOO_LONG' } });
    });

    it('returns INVALID_INPUT/TOO_LONG for a padded string whose trim exceeds 100 chars', () => {
      const input = '  ' + 'a'.repeat(101) + '  ';
      const result = validateCityInput(input);
      expect(result).toEqual({ valid: false, error: { kind: 'INVALID_INPUT', reason: 'TOO_LONG' } });
    });
  });

  describe('valid cases (Requirements 1.5, 1.7)', () => {
    it('accepts a single character city name', () => {
      const result = validateCityInput('A');
      expect(result).toEqual({ valid: true, trimmed: 'A' });
    });

    it('accepts a normal city name', () => {
      const result = validateCityInput('Madrid');
      expect(result).toEqual({ valid: true, trimmed: 'Madrid' });
    });

    it('accepts exactly 100 characters (boundary)', () => {
      const input = 'a'.repeat(100);
      const result = validateCityInput(input);
      expect(result).toEqual({ valid: true, trimmed: input });
    });

    it('trims leading whitespace (Requirement 1.5)', () => {
      const result = validateCityInput('  Buenos Aires');
      expect(result).toEqual({ valid: true, trimmed: 'Buenos Aires' });
    });

    it('trims trailing whitespace (Requirement 1.5)', () => {
      const result = validateCityInput('Buenos Aires   ');
      expect(result).toEqual({ valid: true, trimmed: 'Buenos Aires' });
    });

    it('trims both leading and trailing whitespace', () => {
      const result = validateCityInput('  New York  ');
      expect(result).toEqual({ valid: true, trimmed: 'New York' });
    });

    it('accepts a padded string whose trim is exactly 100 chars', () => {
      const input = ' ' + 'a'.repeat(100) + ' ';
      const result = validateCityInput(input);
      expect(result).toEqual({ valid: true, trimmed: 'a'.repeat(100) });
    });
  });
});
