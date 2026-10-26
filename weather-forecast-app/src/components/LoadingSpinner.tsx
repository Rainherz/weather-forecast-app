import styles from './LoadingSpinner.module.css';

/**
 * LoadingSpinner
 *
 * Displays an animated circular spinner while a request is in progress.
 *
 * Accessibility (WCAG 2.1):
 *   - SC 1.1.1 (Non-text Content): the spinner div is purely decorative
 *     (aria-hidden="true"); the polite live region contains a visually-hidden
 *     "Cargando…" text that is announced by screen readers.
 *   - SC 1.4.3 (Contrast): the visible spinner border uses CSS custom properties
 *     that provide ≥ 4.5:1 contrast ratio against the background in both light
 *     and dark colour schemes (see LoadingSpinner.module.css).
 */
export function LoadingSpinner() {
  return (
    <div
      className={styles.container}
      aria-live="polite"
      aria-label="Cargando"
    >
      {/* Decorative rotating arc — hidden from the accessibility tree */}
      <div className={styles.spinner} aria-hidden="true" />

      {/* Screen-reader-only text satisfying WCAG 2.1 SC 1.1.1 */}
      <span className={styles.srOnly}>Cargando...</span>
    </div>
  );
}

export default LoadingSpinner;
