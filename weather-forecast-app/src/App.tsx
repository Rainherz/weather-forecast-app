/**
 * App — root component that wires the UI together.
 *
 * Uses `useWeather` to manage all app state and exposes `submitCity`.
 * Conditional rendering ensures:
 *   - Only the spinner is shown while loading (Requirement 4.5 — no stale data).
 *   - At most one ErrorMessage is rendered at any time (Requirement 5.3).
 *   - WeatherDisplay is only rendered when status === 'success' and data is
 *     available (Requirement 5.2 — errors are cleared on new submission).
 *
 * Requirements: 4.5, 5.2, 5.3
 */

import { useWeather } from './hooks/useWeather';
import { WeatherForm } from './components/WeatherForm';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { WeatherDisplay } from './components/WeatherDisplay';
import styles from './App.module.css';

function App() {
  const { status, lastQuery, weatherData, error, isLoading, submitCity } = useWeather();

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Pronóstico del Clima</h1>
      </header>

      <main className={styles.main}>
        {/* Search form — always visible; disabled while loading (Req. 2.5) */}
        <WeatherForm
          onSubmit={submitCity}
          isLoading={isLoading}
          defaultValue={lastQuery}
        />

        {/* Loading indicator — shown while a request is in progress (Req. 4.5) */}
        {isLoading && <LoadingSpinner />}

        {/*
         * Error message — rendered only in 'error' state with a non-null error.
         * The hook guarantees at most one error at a time (Req. 5.3) and clears
         * it before each new request (Req. 5.2).
         */}
        {status === 'error' && error && <ErrorMessage error={error} />}

        {/*
         * Weather results — rendered only when status === 'success' and data
         * is present. The hook sets weatherData to null while loading, so the
         * previous result is never shown alongside the spinner (Req. 4.5).
         */}
        {status === 'success' && weatherData && (
          <WeatherDisplay data={weatherData} />
        )}
      </main>
    </div>
  );
}

export default App;
