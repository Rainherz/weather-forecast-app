/**
 * Geocoding API client.
 *
 * Converts a city name into geographic coordinates using the Open-Meteo
 * Geocoding API (`https://geocoding-api.open-meteo.com/v1/search`).
 *
 * Error handling:
 * - Zero results → throws `{ kind: 'CITY_NOT_FOUND', cityName }`
 * - Network error, AbortError, or HTTP status outside 200-299
 *   → throws `{ kind: 'GEOCODING_SERVICE_UNAVAILABLE' }`
 */

import type {
  GeocodingApiResponse,
  GeocodingResult,
  WeatherError,
} from '../types/index';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';

const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

/**
 * Pure function that maps a raw `GeocodingApiResponse` to a `GeocodingResult`.
 *
 * Exported separately so it can be tested with property-based tests without
 * requiring a network layer.
 *
 * @throws `WeatherError` with `kind === 'CITY_NOT_FOUND'` when `results` is
 *         absent or empty.
 */
export function parseGeocodingResponse(
  response: GeocodingApiResponse,
  cityName: string,
): GeocodingResult {
  if (!response.results || response.results.length === 0) {
    throw { kind: 'CITY_NOT_FOUND', cityName } satisfies WeatherError;
  }

  const first = response.results[0];

  return {
    name: first.name,
    country: first.country,
    coordinates: {
      latitude: first.latitude,
      longitude: first.longitude,
    },
  };
}

/**
 * Resolves a city name to geographic coordinates via the Geocoding API.
 *
 * @param name - The city name to search for.
 * @returns A `GeocodingResult` containing name, country, and coordinates.
 * @throws `WeatherError` — either `CITY_NOT_FOUND` or
 *         `GEOCODING_SERVICE_UNAVAILABLE`.
 */
export async function searchCity(name: string): Promise<GeocodingResult> {
  const encodedName = encodeURIComponent(name);
  const url = `${GEOCODING_BASE_URL}?name=${encodedName}&count=1&language=es`;

  let response: Response;

  try {
    response = await fetchWithTimeout(url);
  } catch {
    // Network error, timeout (AbortError), or any other fetch failure
    throw { kind: 'GEOCODING_SERVICE_UNAVAILABLE' } satisfies WeatherError;
  }

  if (!response.ok) {
    throw { kind: 'GEOCODING_SERVICE_UNAVAILABLE' } satisfies WeatherError;
  }

  let data: GeocodingApiResponse;

  try {
    data = (await response.json()) as GeocodingApiResponse;
  } catch {
    // Malformed JSON is treated as a service error
    throw { kind: 'GEOCODING_SERVICE_UNAVAILABLE' } satisfies WeatherError;
  }

  return parseGeocodingResponse(data, name);
}
