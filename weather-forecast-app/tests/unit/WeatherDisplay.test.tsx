import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WeatherDisplay } from '../../src/components/WeatherDisplay';
import type { WeatherData } from '../../src/types/index';

const sampleData: WeatherData = {
  cityName: 'Barcelona',
  country: 'España',
  temperatureCelsius: 21.5,
  relativeHumidityPercent: 65,
  precipitationMm: 0.5,
};

describe('WeatherDisplay', () => {
  it('displays the city name', () => {
    render(<WeatherDisplay data={sampleData} />);
    expect(screen.getByText(/Barcelona/)).toBeInTheDocument();
  });

  it('formats the temperature correctly (e.g. "21.5 °C")', () => {
    render(<WeatherDisplay data={sampleData} />);
    expect(screen.getByText('21.5 °C')).toBeInTheDocument();
  });

  it('formats the humidity correctly (e.g. "65 %")', () => {
    render(<WeatherDisplay data={sampleData} />);
    expect(screen.getByText('65 %')).toBeInTheDocument();
  });

  it('formats the precipitation correctly (e.g. "0.5 mm")', () => {
    render(<WeatherDisplay data={sampleData} />);
    expect(screen.getByText('0.5 mm')).toBeInTheDocument();
  });
});
