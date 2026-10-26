/**
 * Integration tests — full weather forecast flow using MSW.
 *
 * These tests render the full <App /> component and simulate real user
 * interactions. MSW intercepts fetch calls at the network boundary, so
 * the entire stack (useWeather → weatherService → geocodingClient /
 * forecastClient) is exercised.
 *
 * Requirements: 2.3, 3.3, 4.1, 4.2, 4.3, 4.4, 5.4, 5.5
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, it, expect } from 'vitest';
import App from '../../src/App';
import { server } from './server';

describe('Integration: weather forecast flow', () => {
  /**
   * Happy path — the default MSW handlers return Madrid geocoding result and
   * a sunny forecast. After typing "Madrid" and clicking submit the app should
   * display the city name and the three formatted weather values.
   *
   * Requirements: 4.1, 4.2, 4.3, 4.4
   */
  it('happy path: shows weather data for a valid city', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByRole('textbox', { name: /ciudad/i });
    await user.type(input, 'Madrid');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    // City heading (Req. 4.1)
    await waitFor(() => {
      expect(screen.getByText(/Madrid/)).toBeInTheDocument();
    });

    // Temperature formatted to one decimal place + unit (Req. 4.2)
    expect(screen.getByText('22.3 °C')).toBeInTheDocument();

    // Humidity as whole-number percentage (Req. 4.3)
    expect(screen.getByText('58 %')).toBeInTheDocument();

    // Precipitation to one decimal place + unit (Req. 4.4)
    expect(screen.getByText('0.0 mm')).toBeInTheDocument();
  });

  /**
   * City not found — override the geocoding handler so it returns an empty
   * object (no `results` array). The app should display an error mentioning
   * the searched city name.
   *
   * Requirements: 2.3, 5.4
   */
  it('city not found: shows an error alert containing the city name', async () => {
    server.use(
      http.get('https://geocoding-api.open-meteo.com/v1/search', () => {
        return HttpResponse.json({});
      }),
    );

    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByRole('textbox', { name: /ciudad/i });
    await user.type(input, 'Atlantis');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    // Error alert should mention the searched city (Req. 2.3, 5.4)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Atlantis');
  });

  /**
   * Forecast service error — override the forecast handler to return HTTP 503.
   * The app should display an error about the weather service being unavailable
   * (the Spanish word "meteorológico" appears in the FORECAST_SERVICE_UNAVAILABLE
   * message defined in ErrorMessage.tsx).
   *
   * Requirements: 3.3, 5.5
   */
  it('service error: shows an error alert when the forecast API returns 503', async () => {
    server.use(
      http.get('https://api.open-meteo.com/v1/forecast', () => {
        return new HttpResponse(null, { status: 503 });
      }),
    );

    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByRole('textbox', { name: /ciudad/i });
    await user.type(input, 'Madrid');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    // Error alert must mention the weather service ("meteorológico") (Req. 3.3, 5.5)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByRole('alert')).toHaveTextContent('meteorológico');
  });
});
