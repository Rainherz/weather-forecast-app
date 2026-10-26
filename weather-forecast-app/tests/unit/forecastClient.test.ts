/**
 * Unit tests for forecastClient.
 * Tests mapForecastToWeatherData (pure) and getCurrentWeather (HTTP).
 * Requirements: 3.1, 3.2, 3.3, 3.5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  mapForecastToWeatherData,
  getCurrentWeather,
} from '../../src/services/forecastClient';
import type { ForecastApiResponse, Coordinates } from '../../src/types/index';

// ---------------------------------------------------------------------------
// mapForecastToWeatherData — pure function tests
// ---------------------------------------------------------------------------

describe('mapForecastToWeatherData', () => {
  const fullRaw: ForecastApiResponse = {
    latitude: 40.4165,
    longitude: -3.7026,
    timezone: 'Europe/Madrid',
    current: {
      time: '2024-01-15T12:00',
      temperature_2m: 18.7,
      relative_humidity_2m: 62,
      precipitation: 0.3,
    },
    current_units: {
      temperature_2m: '°C',
      relative_humidity_2m: '%',
      precipitation: 'mm',
    },
  };

  it('returns correct WeatherData when all fields are present (no rounding)', () => {
    const result = mapForecastToWeatherData('Madrid', 'Spain', fullRaw);
    expect(result).toEqual({
      cityName: 'Madrid',
      country: 'Spain',
      temperatureCelsius: 18.7,
      relativeHumidityPercent: 62,
      precipitationMm: 0.3,
    });
  });

  it('preserves raw numeric values without rounding', () => {
    const raw: ForecastApiResponse = {
      ...fullRaw,
      current: {
        ...fullRaw.current,
        temperature_2m: 12.34567,
        relative_humidity_2m: 55.5,
        precipitation: 1.23456,
      },
    };
    const result = mapForecastToWeatherData('Berlin', 'Germany', raw);
    expect(result.temperatureCelsius).toBe(12.34567);
    expect(result.relativeHumidityPercent).toBe(55.5);
    expect(result.precipitationMm).toBe(1.23456);
  });

  it('throws FORECAST_SERVICE_UNAVAILABLE when temperature_2m is missing', () => {
    const raw = {
      ...fullRaw,
      current: {
        time: '2024-01-15T12:00',
        relative_humidity_2m: 62,
        precipitation: 0.3,
        // temperature_2m intentionally absent
      },
    } as unknown as ForecastApiResponse;

    expect(() => mapForecastToWeatherData('Madrid', 'Spain', raw)).toThrow(
      expect.objectContaining({ kind: 'FORECAST_SERVICE_UNAVAILABLE' }),
    );
  });

  it('throws FORECAST_SERVICE_UNAVAILABLE when precipitation is missing', () => {
    const raw = {
      ...fullRaw,
      current: {
        time: '2024-01-15T12:00',
        temperature_2m: 18.7,
        relative_humidity_2m: 62,
        // precipitation intentionally absent
      },
    } as unknown as ForecastApiResponse;

    expect(() => mapForecastToWeatherData('Madrid', 'Spain', raw)).toThrow(
      expect.objectContaining({ kind: 'FORECAST_SERVICE_UNAVAILABLE' }),
    );
  });
});

// ---------------------------------------------------------------------------
// getCurrentWeather — HTTP layer tests (fetch is stubbed)
// ---------------------------------------------------------------------------

describe('getCurrentWeather', () => {
  const coords: Coordinates = { latitude: 40.4165, longitude: -3.7026 };

  const fullApiBody: ForecastApiResponse = {
    latitude: 40.4165,
    longitude: -3.7026,
    timezone: 'Europe/Madrid',
    current: {
      time: '2024-01-15T12:00',
      temperature_2m: 18.7,
      relative_humidity_2m: 62,
      precipitation: 0.3,
    },
    current_units: {
      temperature_2m: '°C',
      relative_humidity_2m: '%',
      precipitation: 'mm',
    },
  };

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

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns ForecastApiResponse when all fields are present', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeOkResponse(fullApiBody)));

    const result = await getCurrentWeather(coords);
    expect(result).toEqual(fullApiBody);
  });

  it('throws FORECAST_SERVICE_UNAVAILABLE on HTTP 500', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeErrorResponse(500)));

    await expect(getCurrentWeather(coords)).rejects.toMatchObject({
      kind: 'FORECAST_SERVICE_UNAVAILABLE',
    });
  });

  it('throws FORECAST_SERVICE_UNAVAILABLE when fetch throws (network error)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network failure')));

    await expect(getCurrentWeather(coords)).rejects.toMatchObject({
      kind: 'FORECAST_SERVICE_UNAVAILABLE',
    });
  });
});
