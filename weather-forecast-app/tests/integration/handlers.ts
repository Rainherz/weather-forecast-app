/**
 * MSW default handlers for Open-Meteo API endpoints.
 * Requirements: 2.1, 3.1
 */

import { http, HttpResponse } from 'msw';
import type { ForecastApiResponse, GeocodingApiResponse } from '../../src/types/index';

/** Default geocoding handler — returns Madrid as a single result */
const geocodingHandler = http.get(
  'https://geocoding-api.open-meteo.com/v1/search',
  () => {
    const response: GeocodingApiResponse = {
      results: [
        {
          id: 3117735,
          name: 'Madrid',
          latitude: 40.4165,
          longitude: -3.7026,
          country: 'Spain',
          country_code: 'ES',
          admin1: 'Community of Madrid',
        },
      ],
    };
    return HttpResponse.json(response);
  },
);

/** Default forecast handler — returns a sunny day in Madrid */
const forecastHandler = http.get(
  'https://api.open-meteo.com/v1/forecast',
  () => {
    const response: ForecastApiResponse = {
      latitude: 40.4165,
      longitude: -3.7026,
      timezone: 'Europe/Madrid',
      current: {
        time: '2024-01-15T12:00',
        temperature_2m: 22.3,
        relative_humidity_2m: 58,
        precipitation: 0.0,
      },
      current_units: {
        temperature_2m: '°C',
        relative_humidity_2m: '%',
        precipitation: 'mm',
      },
    };
    return HttpResponse.json(response);
  },
);

export const defaultHandlers = [geocodingHandler, forecastHandler];
