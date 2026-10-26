/**
 * Unit tests for geocodingClient.
 * Tests parseGeocodingResponse (pure) and searchCity (HTTP).
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  parseGeocodingResponse,
  searchCity,
} from '../../src/services/geocodingClient';
import type { GeocodingApiResponse } from '../../src/types/index';

// ---------------------------------------------------------------------------
// parseGeocodingResponse — pure function tests
// ---------------------------------------------------------------------------

describe('parseGeocodingResponse', () => {
  const validResponse: GeocodingApiResponse = {
    results: [
      {
        id: 1,
        name: 'Madrid',
        latitude: 40.4165,
        longitude: -3.7026,
        country: 'Spain',
        country_code: 'ES',
      },
    ],
  };

  it('returns a correct GeocodingResult for a valid response', () => {
    const result = parseGeocodingResponse(validResponse, 'Madrid');
    expect(result).toEqual({
      name: 'Madrid',
      country: 'Spain',
      coordinates: {
        latitude: 40.4165,
        longitude: -3.7026,
      },
    });
  });

  it('throws CITY_NOT_FOUND when results array is empty', () => {
    const response: GeocodingApiResponse = { results: [] };
    expect(() => parseGeocodingResponse(response, 'UnknownCity')).toThrow(
      expect.objectContaining({ kind: 'CITY_NOT_FOUND', cityName: 'UnknownCity' }),
    );
  });

  it('throws CITY_NOT_FOUND when results key is missing', () => {
    const response: GeocodingApiResponse = {};
    expect(() => parseGeocodingResponse(response, 'NoCity')).toThrow(
      expect.objectContaining({ kind: 'CITY_NOT_FOUND', cityName: 'NoCity' }),
    );
  });
});

// ---------------------------------------------------------------------------
// searchCity — HTTP layer tests (fetch is stubbed)
// ---------------------------------------------------------------------------

describe('searchCity', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const makeOkResponse = (body: unknown): Response => {
    return {
      ok: true,
      status: 200,
      json: () => Promise.resolve(body),
    } as unknown as Response;
  };

  const makeErrorResponse = (status: number): Response => {
    return {
      ok: false,
      status,
      json: () => Promise.resolve({}),
    } as unknown as Response;
  };

  it('returns a correct GeocodingResult for a valid API response', async () => {
    const apiBody: GeocodingApiResponse = {
      results: [
        {
          id: 42,
          name: 'Barcelona',
          latitude: 41.3851,
          longitude: 2.1734,
          country: 'Spain',
          country_code: 'ES',
        },
      ],
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeOkResponse(apiBody)));

    const result = await searchCity('Barcelona');
    expect(result).toEqual({
      name: 'Barcelona',
      country: 'Spain',
      coordinates: {
        latitude: 41.3851,
        longitude: 2.1734,
      },
    });
  });

  it('throws CITY_NOT_FOUND when API returns an empty results array', async () => {
    const apiBody: GeocodingApiResponse = { results: [] };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeOkResponse(apiBody)));

    await expect(searchCity('Atlantis')).rejects.toMatchObject({
      kind: 'CITY_NOT_FOUND',
      cityName: 'Atlantis',
    });
  });

  it('throws CITY_NOT_FOUND when API returns a body with no results key', async () => {
    const apiBody: GeocodingApiResponse = {};
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeOkResponse(apiBody)));

    await expect(searchCity('Ghost')).rejects.toMatchObject({
      kind: 'CITY_NOT_FOUND',
      cityName: 'Ghost',
    });
  });

  it('throws GEOCODING_SERVICE_UNAVAILABLE on HTTP 503', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeErrorResponse(503)));

    await expect(searchCity('Madrid')).rejects.toMatchObject({
      kind: 'GEOCODING_SERVICE_UNAVAILABLE',
    });
  });

  it('throws GEOCODING_SERVICE_UNAVAILABLE when fetch throws (network error)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    await expect(searchCity('Madrid')).rejects.toMatchObject({
      kind: 'GEOCODING_SERVICE_UNAVAILABLE',
    });
  });
});
