# Implementation Plan: Weather Forecast App

## Overview

Implementación incremental de la SPA de pronóstico del tiempo usando React 18 + TypeScript + Vite. Las tareas siguen la arquitectura de tres capas definida en el diseño: primero los tipos y utilidades compartidas, luego la capa de datos/API, después la lógica de negocio, y finalmente los componentes UI con su integración.

## Tasks

- [x] 1. Configurar el proyecto y definir los tipos compartidos
  - [x] 1.1 Inicializar el proyecto Vite + React 18 + TypeScript y estructurar los directorios
    - Ejecutar `npm create vite@latest` con template `react-ts`
    - Crear la estructura de carpetas: `src/components/`, `src/services/`, `src/utils/`, `src/types/`, `src/hooks/`, `tests/unit/`, `tests/property/`, `tests/integration/`
    - Instalar dependencias de desarrollo: `vitest`, `@vitest/ui`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `msw`, `fast-check`
    - Configurar `vite.config.ts` con alias de paths y plugin de test de Vitest
    - _Requirements: Todos_

  - [x] 1.2 Definir todas las interfaces y tipos TypeScript en `src/types/index.ts`
    - Declarar `Coordinates`, `GeocodingResult`, `WeatherData`
    - Declarar el discriminated union `WeatherError` con los cinco códigos de error del diseño
    - Declarar `AppStatus`, `AppState`, `WeatherFormProps`, `ErrorMessageProps`, `WeatherDisplayProps`
    - Declarar las interfaces de respuesta cruda `GeocodingApiResponse` y `ForecastApiResponse`
    - _Requirements: 1.3, 1.4, 1.6, 2.3, 2.4, 3.3, 5.3_

- [x] 2. Implementar utilidades base
  - [x] 2.1 Implementar `src/utils/fetchWithTimeout.ts`
    - Implementar `fetchWithTimeout(url: string, timeoutMs?: number): Promise<Response>` usando `AbortController` + `setTimeout` con 10 s por defecto
    - Asegurarse de que `clearTimeout` se llama en el bloque `finally`
    - _Requirements: 2.5, 3.4, 3.5_

  - [ ]* 2.2 Escribir tests unitarios para `fetchWithTimeout`
    - Verificar que aborta tras el timeout configurado
    - Verificar que `clearTimeout` se invoca cuando la petición tiene éxito
    - _Requirements: 3.5_

  - [x] 2.3 Implementar `src/utils/inputValidator.ts`
    - Implementar `validateCityInput(raw: string): { valid: true; trimmed: string } | { valid: false; error: WeatherError }`
    - Cubrir los tres casos: vacío/solo-espacios → `EMPTY`, longitud post-trim > 100 → `TOO_LONG`, válido → trimmed string
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7_

  - [ ]* 2.4 Escribir property test para `inputValidator` — Property 1
    - **Property 1: Whitespace inputs are always invalid**
    - **Validates: Requirements 1.3, 1.4**
    - Usar `fc.string().filter(s => s.trim() === '')` y verificar `result.valid === false` y `reason === 'EMPTY'`
    - _Archivo: `tests/property/inputValidator.property.test.ts`_

  - [ ]* 2.5 Escribir property test para `inputValidator` — Property 2
    - **Property 2: Valid trimmed inputs are accepted**
    - **Validates: Requirements 1.5, 1.7**
    - Usar strings no-whitespace de 1-100 chars; verificar que `result.valid === true` y `trimmed` coincide con `input.trim()`
    - _Archivo: `tests/property/inputValidator.property.test.ts`_

  - [ ]* 2.6 Escribir property test para `inputValidator` — Property 3
    - **Property 3: Inputs exceeding 100 characters are always rejected**
    - **Validates: Requirements 1.6, 2.6**
    - Usar `fc.string({ minLength: 101 })` cuyo trim siga siendo > 100; verificar `reason === 'TOO_LONG'`
    - _Archivo: `tests/property/inputValidator.property.test.ts`_

  - [x] 2.7 Implementar `src/utils/formatters.ts`
    - Implementar `formatTemperature(t: number): string` → `Number(t).toFixed(1) + " °C"`
    - Implementar `formatHumidity(h: number): string` → `Math.round(h) + " %"`
    - Implementar `formatPrecipitation(p: number): string` → `Number(p).toFixed(1) + " mm"`
    - _Requirements: 4.2, 4.3, 4.4_

  - [ ]* 2.8 Escribir property test para `formatTemperature` — Property 8
    - **Property 8: Temperature display rounding**
    - **Validates: Requirements 4.2**
    - Usar `fc.float({ noNaN: true, noDefaultInfinity: true })`; verificar que el resultado termina en un decimal y " °C"
    - _Archivo: `tests/property/formatters.property.test.ts`_

  - [ ]* 2.9 Escribir property test para `formatPrecipitation` — Property 9
    - **Property 9: Precipitation display rounding**
    - **Validates: Requirements 4.4**
    - Usar `fc.float({ min: 0, noNaN: true, noDefaultInfinity: true })`; verificar formato con un decimal y " mm"
    - _Archivo: `tests/property/formatters.property.test.ts`_

- [x] 3. Checkpoint — Verificar utilidades base
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implementar la capa de datos (API clients)
  - [x] 4.1 Implementar `src/services/geocodingClient.ts`
    - Implementar `searchCity(name: string): Promise<GeocodingResult>` usando `fetchWithTimeout`
    - Construir la URL con `count=1&language=es`
    - Parsear `GeocodingApiResponse`: si `results` está ausente o vacío → throw `{ kind: 'CITY_NOT_FOUND', cityName: name }`
    - En error de red o HTTP fuera de 200-299 → throw `{ kind: 'GEOCODING_SERVICE_UNAVAILABLE' }`
    - Mapear el primer resultado a `GeocodingResult`
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 4.2 Escribir property test para `parseGeocodingResponse` — Property 4
    - **Property 4: Geocoding result extraction preserves valid coordinates**
    - **Validates: Requirements 2.2**
    - Usar `fc.record` con `latitude ∈ [-90, 90]` y `longitude ∈ [-180, 180]`; verificar que las coordenadas del resultado son idénticas a las del primer entry
    - _Archivo: `tests/property/geocodingClient.property.test.ts`_

  - [ ]* 4.3 Escribir tests unitarios para `geocodingClient`
    - Caso: respuesta vacía → `CITY_NOT_FOUND`
    - Caso: HTTP 503 → `GEOCODING_SERVICE_UNAVAILABLE`
    - Caso: respuesta válida → `GeocodingResult` correcto
    - _Archivo: `tests/unit/geocodingClient.test.ts`_

  - [x] 4.4 Implementar `src/services/forecastClient.ts`
    - Implementar `getCurrentWeather(coords: Coordinates): Promise<RawForecastData>` usando `fetchWithTimeout`
    - Construir URL con `current=temperature_2m,relative_humidity_2m,precipitation`
    - Implementar `mapForecastToWeatherData(cityName: string, country: string, raw: ForecastApiResponse): WeatherData`
    - Si cualquiera de los tres campos de `current` está ausente → throw `{ kind: 'FORECAST_SERVICE_UNAVAILABLE' }`
    - En error de red, timeout o HTTP fuera de 200-299 → throw `{ kind: 'FORECAST_SERVICE_UNAVAILABLE' }`
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

  - [ ]* 4.5 Escribir property test para `mapForecastToWeatherData` — Property 5
    - **Property 5: Weather data mapping round-trip preserves numeric values**
    - **Validates: Requirements 4.2, 4.3, 4.4**
    - Usar `fc.record` con tres números finitos; verificar que los valores en `WeatherData` son exactamente iguales a los de la API (sin pérdida de precisión en el almacenamiento)
    - _Archivo: `tests/property/forecastClient.property.test.ts`_

  - [ ]* 4.6 Escribir property test para `mapForecastToWeatherData` — Property 6
    - **Property 6: Missing forecast fields produce a service error**
    - **Validates: Requirements 3.3, 4.6**
    - Usar `fc.record` con al menos un campo omitido; verificar que se lanza `FORECAST_SERVICE_UNAVAILABLE` y no se produce `WeatherData` parcial
    - _Archivo: `tests/property/forecastClient.property.test.ts`_

  - [ ]* 4.7 Escribir tests unitarios para `forecastClient`
    - Caso: campos presentes → `WeatherData` correcto
    - Caso: campo ausente → `FORECAST_SERVICE_UNAVAILABLE`
    - Caso: HTTP 500 → `FORECAST_SERVICE_UNAVAILABLE`
    - _Archivo: `tests/unit/forecastClient.test.ts`_

- [x] 5. Checkpoint — Verificar capa de datos
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implementar la lógica de negocio
  - [x] 6.1 Implementar `src/services/weatherService.ts`
    - Implementar `fetchWeather(cityName: string): Promise<WeatherData>` que orquesta `searchCity` → `getCurrentWeather`
    - Propagar todos los errores de dominio (`WeatherError`) sin transformarlos
    - _Requirements: 2.1, 2.2, 3.1, 3.2_

  - [ ]* 6.2 Escribir tests unitarios para `weatherService`
    - Caso: flujo feliz → `WeatherData` completo
    - Caso: `searchCity` lanza `CITY_NOT_FOUND` → `weatherService` lo propaga
    - Caso: `getCurrentWeather` lanza `FORECAST_SERVICE_UNAVAILABLE` → se propaga
    - _Archivo: `tests/unit/weatherService.test.ts`_

  - [x] 6.3 Implementar el hook `src/hooks/useWeather.ts`
    - Manejar el estado `AppState` (`status`, `lastQuery`, `weatherData`, `error`)
    - Exponer `submitCity(cityName: string): void` que llama a `validateCityInput` y luego a `fetchWeather`
    - Deshabilitar submit mientras `status === 'loading'` (retornar `isLoading: boolean`)
    - Limpiar el error al inicio de cada nueva petición; limpiar `weatherData` mientras se carga
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 2.5, 3.4, 4.5, 5.1, 5.2, 5.3_

  - [ ]* 6.4 Escribir tests unitarios para `useWeather`
    - Verificar las transiciones de estado: idle → loading → success / error
    - Verificar que el error se limpia en nueva petición
    - Verificar que `isLoading` es `true` durante la petición
    - _Archivo: `tests/unit/useWeather.test.ts`_

- [x] 7. Implementar los componentes UI
  - [x] 7.1 Implementar `src/components/LoadingSpinner.tsx`
    - Renderizar un spinner visible con `aria-live="polite"` y texto alternativo accesible
    - _Requirements: 2.5, 3.4, 4.5, 6.3_

  - [x] 7.2 Implementar `src/components/ErrorMessage.tsx`
    - Renderizar el mensaje de error correspondiente a cada `WeatherError` con `role="alert"`
    - Cubrir los cinco códigos de error con sus mensajes en español definidos en el diseño
    - _Requirements: 2.3, 2.4, 3.3, 5.1, 5.3, 5.4, 5.5_

  - [x] 7.3 Implementar `src/components/WeatherForm.tsx`
    - Renderizar `<label>` + `<input>` (`City_Input`) y `<button>` submit
    - Asociar el label al input mediante `htmlFor`/`id` para cumplir WCAG 2.1 SC 1.3.1
    - Deshabilitar el botón cuando `isLoading === true`
    - Pasar el valor a `onSubmit` al activar el formulario
    - _Requirements: 1.1, 1.2, 2.5, 5.1, 6.1, 6.2_

  - [x] 7.4 Implementar `src/components/WeatherDisplay.tsx` con sus sub-componentes
    - Renderizar `CityHeading`, `TemperatureCard`, `HumidityCard` y `PrecipitationCard`
    - Usar `formatTemperature`, `formatHumidity` y `formatPrecipitation` para las presentaciones
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 7.5 Escribir tests de componentes para `WeatherForm`
    - Verificar `getByRole('textbox', { name: /ciudad/i })` (accesibilidad)
    - Verificar que el botón se deshabilita con `isLoading=true`
    - Verificar que `onSubmit` recibe el valor recortado
    - _Archivo: `tests/unit/WeatherForm.test.tsx`_

  - [ ]* 7.6 Escribir tests de componentes para `ErrorMessage`
    - Verificar que el elemento tiene `role="alert"`
    - Verificar que se muestra el mensaje correcto para cada código de error
    - _Archivo: `tests/unit/ErrorMessage.test.tsx`_

  - [ ]* 7.7 Escribir tests de componentes para `WeatherDisplay`
    - Verificar que temperatura, humedad y precipitación se muestran con el formato correcto
    - Verificar que se muestra el nombre de la ciudad
    - _Archivo: `tests/unit/WeatherDisplay.test.tsx`_

- [x] 8. Integrar todo en `App.tsx` y `main.tsx`
  - [x] 8.1 Implementar `src/App.tsx`
    - Usar el hook `useWeather` para obtener el estado y la función `submitCity`
    - Renderizar `WeatherForm`, `LoadingSpinner` (condicional), `ErrorMessage` (condicional) y `WeatherDisplay` (condicional) según el `AppStatus`
    - Asegurar que solo se muestra un `ErrorMessage` a la vez
    - _Requirements: 4.5, 5.2, 5.3_

  - [x] 8.2 Verificar contraste de color y estilos de accesibilidad en `App.css` / módulos CSS
    - Asegurar ratio mínimo de 4.5:1 para texto normal
    - Verificar navegación por teclado con `Tab` para todos los elementos interactivos
    - _Requirements: 6.2, 6.4_

  - [ ]* 8.3 Escribir property test para `App` — Property 7
    - **Property 7: At most one error message is shown at a time**
    - **Validates: Requirements 5.3**
    - Usar `fc.array` de eventos de usuario (búsqueda, éxito, error); verificar que en ningún estado hay más de un elemento con `role="alert"`
    - _Archivo: `tests/property/App.property.test.tsx`_

- [x] 9. Checkpoint — Verificar componentes e integración
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implementar tests de integración con MSW
  - [x] 10.1 Configurar MSW con handlers para los dos endpoints de Open-Meteo
    - Crear `tests/integration/handlers.ts` con handlers para `geocoding-api.open-meteo.com` y `api.open-meteo.com`
    - Configurar `setupServer` de MSW en `tests/integration/server.ts`
    - _Requirements: 2.1, 3.1_

  - [ ]* 10.2 Escribir tests de integración: flujo feliz, ciudad no encontrada y error de servicio
    - Flujo feliz: ciudad válida → pronóstico mostrado con los tres valores
    - Ciudad no encontrada: Geocoding API devuelve `{}` → `ErrorMessage` con "ciudad no encontrada"
    - Error de servicio: Forecast API devuelve HTTP 503 → `ErrorMessage` con "servicio no disponible"
    - _Archivo: `tests/integration/weatherFlow.test.tsx`_
    - _Requirements: 2.3, 3.3, 4.1, 4.2, 4.3, 4.4, 5.4, 5.5_

- [x] 11. Checkpoint final — Todos los tests deben pasar
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia los requisitos específicos para trazabilidad completa
- Los checkpoints garantizan validación incremental entre capas
- Los property tests validan propiedades universales con fast-check (mínimo 100 iteraciones)
- Los unit tests validan casos específicos y casos de borde
- Las transformaciones de presentación (redondeo, unidades) ocurren en la capa UI, no en los servicios, para preservar la fidelidad de los datos en los tests de propiedades

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.3", "2.7"] },
    { "id": 2, "tasks": ["2.2", "2.4", "2.5", "2.6", "2.8", "2.9", "4.1", "4.4"] },
    { "id": 3, "tasks": ["4.2", "4.3", "4.5", "4.6", "4.7", "6.1", "7.1", "7.2", "7.3", "7.4"] },
    { "id": 4, "tasks": ["6.2", "6.3", "7.5", "7.6", "7.7"] },
    { "id": 5, "tasks": ["6.4", "8.1", "8.2"] },
    { "id": 6, "tasks": ["8.3", "10.1"] },
    { "id": 7, "tasks": ["10.2"] }
  ]
}
```
