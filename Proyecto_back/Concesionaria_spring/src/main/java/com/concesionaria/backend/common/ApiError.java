package com.concesionaria.backend.common;

import java.time.Instant;
import java.util.Map;

/**
 * Cuerpo JSON uniforme para todos los errores de la API.
 * El frontend Angular muestra directamente el campo {@code message}.
 */
public record ApiError(Instant timestamp, int status, String error, String message, Map<String, String> fields) {
    public static ApiError of(int status, String error, String message) {
        return new ApiError(Instant.now(), status, error, message, Map.of());
    }

    public static ApiError of(int status, String error, String message, Map<String, String> fields) {
        return new ApiError(Instant.now(), status, error, message, fields);
    }
}
