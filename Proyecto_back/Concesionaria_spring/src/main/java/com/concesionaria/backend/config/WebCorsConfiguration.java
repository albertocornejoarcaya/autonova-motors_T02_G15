package com.concesionaria.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Permite que Angular consuma la API directamente (sin proxy) desde los orígenes configurados.
 * Con el proxy de desarrollo (proxy.conf.json) no es necesario, pero se deja preparado.
 */
@Configuration
public class WebCorsConfiguration implements WebMvcConfigurer {
    private final String[] allowedOrigins;

    public WebCorsConfiguration(@Value("${app.cors.allowed-origins:http://localhost:4200}") String[] allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
