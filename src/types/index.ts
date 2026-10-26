/**
 * Shared TypeScript types and interfaces for the Weather Forecast App.
 */

// --- Domain models ---

/** WGS84 geographic coordinates */
export interface Coordinates {
  latitude: number;   // -90.0 to 90.0
  longitude: number;  // -180.0 to 180.0
}

/** Result from the Geocoding API after mapping */
export interface GeocodingResult {
  name: string;
  country: string;
  coordinates: Coordinates;
}

/** Current weather values (mapped from API) */
export interface WeatherData {
  cityName: string;
  country: string;
  temperatureCelsius: number;
  relativeHumidityPercent: number;
  precipitationMm: number;
}

// --- Domain errors ---

export type WeatherError =
  | { kind: 'CITY_NOT_FOUND'; cityName: string }
  | { kind: 'GEOCODING_SERVICE_UNAVAILABLE' }
  | { kind: 'FORECAST_SERVICE_UNAVAILABLE' }
  | { kind: 'INVALID_INPUT'; reason: 'EMPTY' | 'TOO_LONG' };

// --- Application state ---

export type AppStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AppState {
  status: AppStatus;
  lastQuery: string;
  weatherData: WeatherData | null;
  error: WeatherError | null;
}

// --- Component props ---

export interface WeatherFormProps {
  onSubmit: (cityName: string) => void;
  isLoading: boolean;
  defaultValue: string;
}

export interface ErrorMessageProps {
  error: WeatherError;
}

export interface WeatherDisplayProps {
  data: WeatherData;
}

// --- Raw API response types ---

export interface GeocodingApiResponse {
  results?: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    country_code: string;
    admin1?: string;
  }>;
}

export interface ForecastApiResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
  };
  current_units: {
    temperature_2m: string;
    relative_humidity_2m: string;
    precipitation: string;
  };
}
