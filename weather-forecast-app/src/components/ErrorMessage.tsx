import type { ErrorMessageProps } from '../types/index';
import styles from './ErrorMessage.module.css';

function getErrorMessage(error: ErrorMessageProps['error']): string {
  switch (error.kind) {
    case 'INVALID_INPUT':
      if (error.reason === 'EMPTY') {
        return 'Por favor, introduce el nombre de una ciudad.';
      }
      // reason === 'TOO_LONG'
      return 'El nombre de la ciudad es demasiado largo (máx. 100 caracteres).';

    case 'CITY_NOT_FOUND':
      return `No se ha encontrado la ciudad «${error.cityName}».`;

    case 'GEOCODING_SERVICE_UNAVAILABLE':
      return 'El servicio de localización no está disponible. Inténtalo de nuevo.';

    case 'FORECAST_SERVICE_UNAVAILABLE':
      return 'El servicio meteorológico no está disponible. Inténtalo de nuevo.';
  }
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  return (
    <div role="alert" className={styles.errorContainer}>
      <svg
        className={styles.errorIcon}
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
          clipRule="evenodd"
        />
      </svg>
      <p className={styles.errorText}>{getErrorMessage(error)}</p>
    </div>
  );
}
