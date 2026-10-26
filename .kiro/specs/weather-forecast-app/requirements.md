# Requirements Document

## Introduction

Esta aplicación web permite al usuario ingresar el nombre de una ciudad y obtener un pronóstico del clima actualizado. La aplicación utiliza la API de geolocalización de Open-Meteo para convertir el nombre de la ciudad en coordenadas geográficas (latitud y longitud), y luego consulta la API de pronóstico de Open-Meteo para recuperar y mostrar temperatura, humedad y precipitaciones.

## Glossary

- **Weather_App**: La aplicación web de pronóstico del clima descrita en este documento.
- **Geocoding_API**: El servicio de geolocalización de Open-Meteo que convierte nombres de ciudades en coordenadas geográficas (`https://geocoding-api.open-meteo.com/v1/search`).
- **Forecast_API**: El servicio de pronóstico del tiempo de Open-Meteo que retorna datos meteorológicos a partir de coordenadas (`https://api.open-meteo.com/v1/forecast`).
- **City_Input**: El campo de texto donde el usuario ingresa el nombre de la ciudad.
- **Coordinates**: Par de valores numéricos (latitud y longitud) que identifican una ubicación geográfica.
- **Forecast_Result**: El conjunto de datos meteorológicos (temperatura, humedad, precipitaciones) obtenidos de la Forecast_API.
- **Error_Message**: Texto descriptivo mostrado al usuario cuando ocurre un fallo en cualquier etapa del flujo.

## Requirements

### Requirement 1: Entrada del nombre de ciudad

**User Story:** As a user, I want to enter a city name into a text field, so that I can request the weather forecast for that location.

#### Acceptance Criteria

1. THE Weather_App SHALL render a City_Input text field visible on the main page at load time.
2. THE Weather_App SHALL render a submit button that triggers the forecast retrieval flow when activated.
3. WHEN the user activates the submit button with an empty City_Input, THE Weather_App SHALL display an Error_Message indicating that a city name is required.
4. WHEN the user activates the submit button with a City_Input containing only whitespace characters, THE Weather_App SHALL display an Error_Message indicating that a city name is required.
5. THE Weather_App SHALL trim leading and trailing whitespace from the City_Input value before sending it to the Geocoding_API.
6. IF the post-trim City_Input value exceeds 100 characters, THEN THE Weather_App SHALL display an Error_Message indicating the city name is too long and SHALL NOT send a request to the Geocoding_API.
7. IF the post-trim City_Input value is between 1 and 100 characters inclusive, THEN THE Weather_App SHALL accept the value and proceed with the geocoding request.

---

### Requirement 2: Conversión de nombre de ciudad a coordenadas geográficas

**User Story:** As a user, I want the application to automatically resolve my city name to geographic coordinates, so that I do not have to look them up manually.

#### Acceptance Criteria

1. WHEN the user submits a city name between 1 and 100 characters, THE Weather_App SHALL send a request to the Geocoding_API using that city name as the search parameter within 2 seconds of submission.
2. WHEN the Geocoding_API returns at least one result, THE Weather_App SHALL use the latitude and longitude of the first result as the Coordinates for the forecast query, where latitude is a decimal value between -90.0 and 90.0 and longitude is a decimal value between -180.0 and 180.0.
3. IF the Geocoding_API returns zero results for the submitted city name, THEN THE Weather_App SHALL display an Error_Message indicating that the city was not found and preserve the previously entered city name in the input field.
4. IF the Geocoding_API request fails due to a network error or returns an HTTP status code outside the 200–299 range, THEN THE Weather_App SHALL display an Error_Message indicating that the location service is unavailable and preserve the previously entered city name in the input field.
5. WHILE a Geocoding_API request is in progress, THE Weather_App SHALL display a loading indicator and disable the submit control to prevent duplicate requests.
6. IF the submitted city name exceeds 100 characters, THEN THE Weather_App SHALL display an Error_Message indicating the name is too long and SHALL NOT send a request to the Geocoding_API.

---

### Requirement 3: Consulta del pronóstico del clima

**User Story:** As a user, I want the application to fetch current weather data using the resolved coordinates, so that I receive up-to-date forecast information.

#### Acceptance Criteria

1. WHEN valid Coordinates are obtained from the Geocoding_API, THE Weather_App SHALL send a request to the Forecast_API including those Coordinates and requesting current temperature (°C), relative humidity (%), and precipitation (mm).
2. WHEN the Forecast_API returns a successful response, THE Weather_App SHALL extract the current temperature, relative humidity, and precipitation values from the response payload.
3. IF the Forecast_API request fails due to a network error, returns an HTTP status code outside the 200–299 range, or the response payload is missing one or more of the required fields (current temperature, relative humidity, or precipitation), THEN THE Weather_App SHALL display an Error_Message indicating that the weather service is unavailable.
4. WHILE a Forecast_API request is in progress, THE Weather_App SHALL display a loading indicator to the user; WHEN the request completes or fails, THE Weather_App SHALL hide the loading indicator.
5. IF the Forecast_API does not return a response within 10 seconds of the request being sent, THEN THE Weather_App SHALL cancel the request and display an Error_Message indicating that the weather service is unavailable.

---

### Requirement 4: Visualización del pronóstico del clima

**User Story:** As a user, I want to see the temperature, humidity, and precipitation for the city I searched, so that I can plan my activities accordingly.

#### Acceptance Criteria

1. WHEN a Forecast_Result is successfully retrieved, THE Weather_App SHALL display the name of the resolved city in the same view as the forecast data.
2. WHEN a Forecast_Result is successfully retrieved, THE Weather_App SHALL display the current temperature expressed in degrees Celsius (°C), rounded to one decimal place.
3. WHEN a Forecast_Result is successfully retrieved, THE Weather_App SHALL display the current relative humidity as a whole-number percentage (%).
4. WHEN a Forecast_Result is successfully retrieved, THE Weather_App SHALL display the current precipitation accumulated over the preceding one-hour period expressed in millimetres (mm), rounded to one decimal place.
5. WHILE a new city search is in progress, THE Weather_App SHALL clear the previous Forecast_Result and display the loading indicator instead.
6. IF the Forecast_Result is received but one or more required fields (temperature, humidity, or precipitation) are absent, THEN THE Weather_App SHALL display an Error_Message and SHALL NOT display partial forecast values.

---

### Requirement 5: Manejo de errores y recuperación

**User Story:** As a user, I want clear feedback when something goes wrong, so that I can understand the problem and try again.

#### Acceptance Criteria

1. IF any Error_Message is displayed, THEN THE Weather_App SHALL keep the City_Input field enabled and editable, pre-filled with the last submitted value.
2. WHEN the user submits a city name while an Error_Message is displayed, THE Weather_App SHALL remove the Error_Message immediately upon submission before initiating the new request.
3. THE Weather_App SHALL display at most one Error_Message at a time.
4. IF the submitted city name is not found, THEN THE Weather_App SHALL display an Error_Message indicating the city was not found.
5. IF the weather data cannot be retrieved due to a network or service failure, THEN THE Weather_App SHALL display an Error_Message indicating the service is temporarily unavailable.

---

### Requirement 6: Accesibilidad e internacionalización

**User Story:** As a user with assistive technology needs, I want the interface to be accessible, so that I can use it with a screen reader or keyboard navigation.

#### Acceptance Criteria

1. THE Weather_App SHALL provide a descriptive label associated with the City_Input field that is programmatically determinable by assistive technologies (WCAG 2.1 SC 1.3.1).
2. THE Weather_App SHALL ensure that all interactive elements (City_Input, submit button) are operable via keyboard without requiring a pointer device (WCAG 2.1 SC 2.1.1).
3. THE Weather_App SHALL provide a text alternative for any non-text loading indicator so that assistive technologies can convey its state (WCAG 2.1 SC 1.1.1).
4. THE Weather_App SHALL use sufficient colour contrast (minimum ratio 4.5:1 for normal text) for all visible text elements (WCAG 2.1 SC 1.4.3).
