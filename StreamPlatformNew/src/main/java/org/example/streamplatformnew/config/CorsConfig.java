package org.example.streamplatformnew.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Allows the Vite dev server to call the API directly from its own origin.
 *
 * <p>In day-to-day dev the Vite proxy already makes requests same-origin, so this mainly
 * covers direct calls and preflights. Picked up by {@code http.cors(...)} in
 * {@link org.example.streamplatformnew.Security.SecurityFilterChain}.
 */
@Configuration
public class CorsConfig {

    /** Override with the CORS_ALLOWED_ORIGINS env var (comma-separated) when deploying. */
    @Value("${app.cors.allowed-origins:http://localhost:3000,http://localhost:5173}")
    private List<String> allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(allowedOrigins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
