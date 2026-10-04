package com.concesionaria.backend.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Control de acceso por rol basado en la sesión HTTP.
 * Roles: 1 = Administrador, 2 = Asesor de Ventas, 3 = Jefe de Almacén.
 */
@Component
public class ApiAccessInterceptor implements HandlerInterceptor {
    public static final int ROLE_ADMIN = 1;
    public static final int ROLE_SALES = 2;
    public static final int ROLE_WAREHOUSE = 3;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String path = request.getRequestURI();
        String method = request.getMethod();

        if (isPublic(method, path)) {
            return true;
        }

        HttpSession session = request.getSession(false);
        Object roleValue = session == null ? null : session.getAttribute("roleId");
        if (!(roleValue instanceof Integer roleId)) {
            return reject(response, HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized",
                    "Debes iniciar sesión para acceder a este recurso");
        }

        if (path.startsWith("/api/users") && roleId != ROLE_ADMIN) {
            return reject(response, HttpServletResponse.SC_FORBIDDEN, "Forbidden",
                    "Se requiere el rol Administrador");
        }
        if (path.startsWith("/api/vehicles") && !"GET".equals(method) && roleId != ROLE_ADMIN && roleId != ROLE_WAREHOUSE) {
            return reject(response, HttpServletResponse.SC_FORBIDDEN, "Forbidden",
                    "Se requiere el rol Administrador o Jefe de Almacén");
        }
        boolean commercialPath = path.startsWith("/api/reservations") || path.startsWith("/api/sales")
                || path.startsWith("/api/clients");
        if (commercialPath && roleId != ROLE_ADMIN && roleId != ROLE_SALES) {
            return reject(response, HttpServletResponse.SC_FORBIDDEN, "Forbidden",
                    "Se requiere el rol Administrador o Asesor de Ventas");
        }
        return true;
    }

    private boolean isPublic(String method, String path) {
        if ("OPTIONS".equals(method)) {
            return true;
        }
        if ("GET".equals(method) && (path.startsWith("/api/vehicles") || "/api/auth/me".equals(path))) {
            return true;
        }
        return "POST".equals(method) && ("/api/auth/login".equals(path) || "/api/auth/logout".equals(path)
                || "/api/auth/bootstrap-admin".equals(path) || "/api/clients".equals(path));
    }

    private boolean reject(HttpServletResponse response, int status, String error, String message) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write("{\"timestamp\":\"" + Instant.now() + "\",\"status\":" + status
                + ",\"error\":\"" + error + "\",\"message\":\"" + message + "\",\"fields\":{}}");
        return false;
    }
}
