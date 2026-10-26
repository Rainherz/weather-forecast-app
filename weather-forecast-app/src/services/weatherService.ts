/**
 * Weather service — orchestration layer.
 *
 * Coordinates the full flow:
 *   1. Resolve city name to coordinates via geocodingClient.
 *   2. Fetch current weather for those coordinates via forecastClient.
 *   3. Map the raw API response to the domain WeatherData type.
 *
 * All WeatherError exceptions thrown by the underlying clients propagate
 * naturally to the caller — no try/catch is introduced here.
 *
 * Requirements: 2.1, 2.2, 3.1, 3.2
 */

import type { WeatherData } from '../types/index';
import { searchCity } from '../services/geocodingClient';
import { getCurrentWeather, mapForecastToWeatherData } from '../services/forecastClient';

/**
 * Fetches current weather data for the given city name.
 *
 * @param cityName - Pre-validated, trimmed city name (1–100 characters).
 * @returns         Mapped `WeatherData` domain object.
 * @throws          `WeatherError` — any of:
 *                  - `CITY_NOT_FOUND`              (geocoding: no results)
 *                  - `GEOCODING_SERVICE_UNAVAILABLE` (geocoding: network/HTTP error)
 *                  - `FORECAST_SERVICE_UNAVAILABLE`  (forecast: network/HTTP/missing-field error)
 */
export async function fetchWeather(cityName: string): Promise<WeatherData> {
  const { name, country, coordinates } = await searchCity(cityName);
  const rawForecast = await getCurrentWeather(coordinates);
  return mapForecastToWeatherData(name, country, rawForecast);
}
