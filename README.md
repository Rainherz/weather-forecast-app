# Weather Forecast App

Aplicación web que muestra el clima actual de cualquier ciudad: el usuario escribe un nombre y obtiene temperatura, humedad relativa y precipitación en tiempo real. Se construyó aplicando **Spec-Driven Development (SDD)** con el IDE **Kiro**, como parte del Laboratorio 3 de Tópicos Avanzados de Ingeniería de Software.

## Inicio rápido

```bash
cd weather-forecast-app
npm install
npm run dev      # http://localhost:5173
npm test         # 67 pruebas
```

No necesita claves de API: usa los servicios públicos de [Open-Meteo](https://open-meteo.com/).

## Qué hace

1. Valida el nombre ingresado (no vacío, máximo 100 caracteres).
2. Convierte la ciudad en coordenadas con la **Geocoding API** de Open-Meteo.
3. Consulta el clima actual con la **Forecast API**.
4. Muestra temperatura (°C), humedad (%) y precipitación (mm).

| Situación | Respuesta de la app |
|-----------|---------------------|
| Ciudad válida | Tarjetas con los tres valores del clima |
| Ciudad inexistente | «No se ha encontrado la ciudad …» |
| Entrada vacía o mayor a 100 caracteres | Mensaje de validación, sin llamar a la API |
| Servicio caído o sin respuesta en 10 s | Mensaje de servicio no disponible |

La interfaz sigue criterios de accesibilidad WCAG 2.1: label asociado al campo, uso completo por teclado, alertas con `role="alert"` y contraste mínimo de 4.5:1.

## Cómo se hizo: Spec-Driven Development con Kiro

En lugar de escribir código directamente, primero se especificó y luego se implementó. A partir de un prompt inicial, Kiro generó tres artefactos en [`.kiro/specs/weather-forecast-app/`](.kiro/specs/weather-forecast-app/):

| Fase | Archivo | Contenido |
|------|---------|-----------|
| 1. Requisitos | [`requirements.md`](.kiro/specs/weather-forecast-app/requirements.md) | 6 requisitos con historias de usuario y criterios de aceptación en notación EARS (`WHEN … THE Weather_App SHALL …`) |
| 2. Diseño | [`design.md`](.kiro/specs/weather-forecast-app/design.md) | Arquitectura en capas, modelos de datos, mapeo API → dominio y 9 propiedades de corrección |
| 3. Tareas | [`tasks.md`](.kiro/specs/weather-forecast-app/tasks.md) | 11 tareas con subtareas, ordenadas en oleadas según sus dependencias |

Después, el agente de Kiro ejecutó las tareas una por una. Cada tarea referencia los requisitos que cubre, y los checkpoints corren las pruebas antes de avanzar a la siguiente capa.

## Arquitectura

```
weather-forecast-app/src/
├── types/        Modelos de dominio y la unión discriminada WeatherError
├── utils/        fetchWithTimeout (10 s), validateCityInput, formatters
├── services/     geocodingClient, forecastClient, weatherService
├── hooks/        useWeather: estado de carga, datos y error
└── components/   WeatherForm, WeatherDisplay, ErrorMessage, LoadingSpinner
```

El flujo de una consulta es `useWeather → validateCityInput → weatherService → geocodingClient → forecastClient`. El mapeo de las respuestas de la API se hace con funciones puras, para poder probarlas de forma aislada.

**Stack:** React 19, TypeScript, Vite, Vitest, Testing Library y Mock Service Worker (MSW).

## Pruebas

| Tipo | Archivos | Pruebas | Qué cubren |
|------|----------|---------|------------|
| Unitarias: lógica | 5 | 50 | Validación, formato, clientes de API y timeout |
| Unitarias: componentes | 3 | 14 | Formulario, mensajes de error y visualización |
| Integración (MSW) | 1 | 3 | Flujo feliz, ciudad no encontrada y servicio caído |
| **Total** | **9** | **67** | |

## Limitaciones conocidas

- Las 9 propiedades de corrección del diseño se pensaron para pruebas basadas en propiedades con `fast-check`. Kiro las marcó como opcionales y no se implementaron.
- `formatPrecipitation` y `formatTemperature` usan `toFixed(1)`, que hereda la imprecisión de coma flotante: `2.05` se muestra como `2.0`. La prueba correspondiente usa el valor `2.16`, que evita el caso.
