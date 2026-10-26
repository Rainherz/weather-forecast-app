import type { WeatherData, WeatherDisplayProps } from '../types/index';
import {
  formatTemperature,
  formatHumidity,
  formatPrecipitation,
} from '../utils/formatters';
import styles from './WeatherDisplay.module.css';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * CityHeading
 *
 * Displays the resolved city name and country code.
 * Requirements: 4.1
 */
function CityHeading({ data }: { data: WeatherData }) {
  return (
    <h2 className={styles.cityHeading}>
      {data.cityName}
      {data.country && (
        <span className={styles.countryLabel}>, {data.country}</span>
      )}
    </h2>
  );
}

/**
 * TemperatureCard
 *
 * Displays the current temperature formatted to one decimal place in °C.
 * Requirements: 4.2
 */
function TemperatureCard({ data }: { data: WeatherData }) {
  return (
    <div className={styles.card}>
      <p className={styles.cardLabel}>Temperatura</p>
      <p className={styles.cardValue}>{formatTemperature(data.temperatureCelsius)}</p>
    </div>
  );
}

/**
 * HumidityCard
 *
 * Displays the current relative humidity as a whole-number percentage.
 * Requirements: 4.3
 */
function HumidityCard({ data }: { data: WeatherData }) {
  return (
    <div className={styles.card}>
      <p className={styles.cardLabel}>Humedad</p>
      <p className={styles.cardValue}>{formatHumidity(data.relativeHumidityPercent)}</p>
    </div>
  );
}

/**
 * PrecipitationCard
 *
 * Displays the current precipitation rounded to one decimal place in mm.
 * Requirements: 4.4
 */
function PrecipitationCard({ data }: { data: WeatherData }) {
  return (
    <div className={styles.card}>
      <p className={styles.cardLabel}>Precipitación</p>
      <p className={styles.cardValue}>{formatPrecipitation(data.precipitationMm)}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * WeatherDisplay
 *
 * Renders the full weather result for a city: the city heading plus three
 * metric cards (temperature, humidity, precipitation) in a responsive grid.
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */
export function WeatherDisplay({ data }: WeatherDisplayProps) {
  return (
    <section className={styles.container} aria-label={`Pronóstico para ${data.cityName}`}>
      <CityHeading data={data} />
      <div className={styles.cardsGrid}>
        <TemperatureCard data={data} />
        <HumidityCard data={data} />
        <PrecipitationCard data={data} />
      </div>
    </section>
  );
}

export default WeatherDisplay;
