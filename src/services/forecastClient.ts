/**
 * Forecast API client for Open-Meteo.
 *
 * Responsibilities:
 * - Fetch current weather data for given coordinates via the Forecast API.
 * - Map the raw API response to the domain `WeatherData` type.
 * - Throw `{ kind: 'FORECAST_SERVICE_UNAVAILABLE' }` on any network, timeout,
 *   HTTP error, or missing-field condition.
 *
 * Requirements: 3.1, 3.2, 3.3, 3.5
 */

import type {
  Coordinates,
  WeatherData,
  ForecastApiResponse,
  WeatherError,
} from '../types/index';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';

const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Fetches current weather data from the Open-Meteo Forecast API.
 *
 * Builds a URL requesting `temperature_2m`, `relative_humidity_2m`, and
 * `precipitation` for the supplied coordinates, then delegates the HTTP call
 * to `fetchWithTimeout` (10 s default).
 *
 * @param coords - WGS84 latitude/longitude pair.
 * @returns       Parsed `ForecastApiResponse` from the API.
 * @throws        `WeatherError` with `kind: 'FORECAST_SERVICE_UNAVAILABLE'` on
 *                any network failure, `AbortError` (timeout), or HTTP status
 *                outside 200–299.
 */
export async function getCurrentWeather(
  coords: Coordinates,
): Promise<ForecastApiResponse> {
  const url =
    `${FORECAST_BASE_URL}` +
    `?latitude=${coords.latitude}` +
    `&longitude=${coords.longitude}` +
    `&current=temperature_2m,relative_humidity_2m,precipitation`;

  let response: Response;

  try {
    response = await fetchWithTimeout(url);
  } catch {
    // Network error or AbortError (timeout)
    throw { kind: 'FORECAST_SERVICE_UNAVAILABLE' } satisfies WeatherError;
  }

  if (!response.ok) {
    throw { kind: 'FORECAST_SERVICE_UNAVAILABLE' } satisfies WeatherError;
  }

  const data = (await response.json()) as ForecastApiResponse;
  return data;
}

/**
 * Maps a raw `ForecastApiResponse` to the domain `WeatherData` type.
 *
 * Validates that all three required numeric fields are present and non-null.
 * Values are stored without rounding; presentation rounding is handled in the
 * UI layer so that property tests can verify numeric fidelity.
 *
 * Exported as a pure function for property-based testing.
 *
 * @param cityName - Resolved city name from the Geocoding API.
 * @param country  - Country name from the Geocoding API.
 * @param raw      - Raw response received from the Forecast API.
 * @returns         Mapped `WeatherData` domain object.
 * @throws          `WeatherError` with `kind: 'FORECAST_SERVICE_UNAVAILABLE'`
 *                  if any required field is absent or `null`/`undefined`.
 */
export function mapForecastToWeatherData(
  cityName: string,
  country: string,
  raw: ForecastApiResponse,
): WeatherData {
  const current = raw.current;

  if (
    current == null ||
    current.temperature_2m == null ||
    current.relative_humidity_2m == null ||
    current.precipitation == null
  ) {
    throw { kind: 'FORECAST_SERVICE_UNAVAILABLE' } satisfies WeatherError;
  }

  return {
    cityName,
    country,
    temperatureCelsius: current.temperature_2m,
    relativeHumidityPercent: current.relative_humidity_2m,
    precipitationMm: current.precipitation,
  };
}
