/**
 * useWeather — custom React hook for the weather forecast app.
 *
 * Manages the full AppState lifecycle:
 *   - Validates the city name input via `validateCityInput`.
 *   - Orchestrates the async `fetchWeather` call.
 *   - Exposes a stable `submitCity` callback and derived `isLoading` flag.
 *
 * State invariants (Requirements 5.1, 5.2, 5.3):
 *   - On error:   `error` is set, `weatherData` is null.
 *   - On success: `weatherData` is set, `error` is null.
 *   - On loading: `weatherData` is null, `error` is null, `isLoading` is true.
 *
 * Requirements: 1.3, 1.4, 1.5, 1.6, 2.5, 3.4, 4.5, 5.1, 5.2, 5.3
 */

import { useState } from 'react';
import type { AppState, WeatherData, WeatherError } from '../types/index';
import { validateCityInput } from '../utils/inputValidator';
import { fetchWeather } from '../services/weatherService';

interface UseWeatherReturn {
  status: AppState['status'];
  lastQuery: string;
  weatherData: WeatherData | null;
  error: WeatherError | null;
  isLoading: boolean;
  submitCity: (cityName: string) => void;
}

/**
 * Provides weather query state and the `submitCity` action.
 *
 * @returns An object containing the current AppState fields plus `isLoading`
 *          (derived) and `submitCity` (stable dispatch function).
 */
export function useWeather(): UseWeatherReturn {
  const [status, setStatus] = useState<AppState['status']>('idle');
  const [lastQuery, setLastQuery] = useState<string>('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<WeatherError | null>(null);

  /**
   * Validates `cityName`, then initiates an async weather fetch.
   *
   * Steps:
   * 1. Run `validateCityInput` — on failure, set error state immediately (no fetch).
   * 2. On success, clear prior error, set loading state, then call `fetchWeather`.
   * 3. On fetch success, populate `weatherData` and clear error.
   * 4. On fetch failure (WeatherError thrown), set error and clear `weatherData`.
   */
  function submitCity(cityName: string): void {
    const result = validateCityInput(cityName);

    if (!result.valid) {
      // Requirement 1.3, 1.4, 1.6: invalid input → show error, do not fetch
      setStatus('error');
      setError(result.error);
      setWeatherData(null);
      return;
    }

    const trimmed = result.trimmed;

    // Requirement 5.2: clear previous error before new request
    // Requirement 4.5: clear previous weatherData while loading
    setError(null);
    setWeatherData(null);
    setStatus('loading');
    setLastQuery(trimmed);

    // Requirement 2.5, 3.4: async fetch; isLoading disables submit during this
    fetchWeather(trimmed).then(
      (data) => {
        // Requirement 5.1: success — set data, ensure error is null
        setWeatherData(data);
        setError(null);
        setStatus('success');
      },
      (err: WeatherError) => {
        // Requirement 5.1, 5.4, 5.5: fetch failed — set error, clear weatherData
        setWeatherData(null);
        setError(err);
        setStatus('error');
      },
    );
  }

  return {
    status,
    lastQuery,
    weatherData,
    error,
    isLoading: status === 'loading',
    submitCity,
  };
}
