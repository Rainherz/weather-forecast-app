import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ErrorMessage } from '../../src/components/ErrorMessage';
import type { WeatherError } from '../../src/types/index';

describe('ErrorMessage', () => {
  it('renders an element with role="alert"', () => {
    const error: WeatherError = { kind: 'FORECAST_SERVICE_UNAVAILABLE' };
    render(<ErrorMessage error={error} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows the correct message for INVALID_INPUT / EMPTY', () => {
    const error: WeatherError = { kind: 'INVALID_INPUT', reason: 'EMPTY' };
    render(<ErrorMessage error={error} />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Por favor, introduce el nombre de una ciudad.'
    );
  });

  it('shows the correct message for CITY_NOT_FOUND including the city name', () => {
    const error: WeatherError = { kind: 'CITY_NOT_FOUND', cityName: 'Atlantis' };
    render(<ErrorMessage error={error} />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se ha encontrado la ciudad «Atlantis».'
    );
  });

  it('shows the correct message for GEOCODING_SERVICE_UNAVAILABLE', () => {
    const error: WeatherError = { kind: 'GEOCODING_SERVICE_UNAVAILABLE' };
    render(<ErrorMessage error={error} />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'El servicio de localización no está disponible. Inténtalo de nuevo.'
    );
  });

  it('shows the correct message for FORECAST_SERVICE_UNAVAILABLE', () => {
    const error: WeatherError = { kind: 'FORECAST_SERVICE_UNAVAILABLE' };
    render(<ErrorMessage error={error} />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'El servicio meteorológico no está disponible. Inténtalo de nuevo.'
    );
  });
});
