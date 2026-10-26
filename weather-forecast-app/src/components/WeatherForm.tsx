import { useState } from 'react';
import type { WeatherFormProps } from '../types/index';
import styles from './WeatherForm.module.css';

/**
 * WeatherForm — Renders the city search form.
 *
 * Accessibility:
 * - <label htmlFor="city-input"> is programmatically associated with the input
 *   (WCAG 2.1 SC 1.3.1 — Info and Relationships).
 * - All interactive elements are keyboard-operable (WCAG 2.1 SC 2.1.1).
 * - The submit button is disabled while a request is in progress to prevent
 *   duplicate submissions (Req. 2.5).
 */
export function WeatherForm({ onSubmit, isLoading, defaultValue }: WeatherFormProps) {
  const [inputValue, setInputValue] = useState(defaultValue);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(inputValue);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.formGroup}>
        {/* Associates the label with the input — WCAG 2.1 SC 1.3.1 */}
        <label htmlFor="city-input" className={styles.label}>
          Nombre de la ciudad
        </label>
        <input
          id="city-input"
          type="text"
          className={styles.input}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          disabled={isLoading}
          aria-disabled={isLoading}
        />
      </div>
      <button
        type="submit"
        className={styles.button}
        disabled={isLoading}
        aria-disabled={isLoading}
      >
        {isLoading ? 'Buscando…' : 'Buscar'}
      </button>
    </form>
  );
}

export default WeatherForm;
