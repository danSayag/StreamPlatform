package org.example.streamplatformnew.Security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Defines the HTTP security rules for the API.
 *
 * <p>Note: this class shadows Spring's own {@code SecurityFilterChain} interface, so the
 * bean below has to declare that interface by its fully qualified name.
 */
@Configuration
public class SecurityFilterChain {

    private final JwtAuthFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    public SecurityFilterChain(JwtAuthFilter jwtAuthFilter, AuthenticationProvider authenticationProvider) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.authenticationProvider = authenticationProvider;
    }

    // Named apiSecurityFilterChain, not securityFilterChain: this @Configuration class is
    // itself registered under the bean name "securityFilterChain", so a matching @Bean
    // method name collides and fails startup with BeanDefinitionOverrideException.
    @Bean
    public org.springframework.security.web.SecurityFilterChain apiSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults()) // Uses the CorsConfigurationSource bean in config.CorsConfig
            .csrf(csrf -> csrf.disable()) // Disabled because JWTs are stateless
            .authorizeHttpRequests(auth -> auth
                // Preflight carries no Authorization header, so it must clear the rules below
                // or every cross-origin POST fails before the real request is ever sent.
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/v1/auth/**").permitAll() // Allow sign-up and login public access
                // The admin panel shell must load before anyone can log in: a browser sends no
                // Authorization header when navigating, so these files cannot be role-gated.
                // They carry no data - every endpoint they call is authenticated below.
                .requestMatchers("/", "/index.html", "/favicon.ico", "/style/**", "/javascript/**").permitAll()

                // --- BEGIN tiered access ---------------------------------------------------
                // Signup issues ROLE_USER accounts, so the catch-all can no longer be
                // hasRole("ADMIN") - that would give every new user a working login and a 403
                // on every screen. Reading the catalog needs only a valid token; everything
                // that writes stays admin-only.
                // To revert to admin-only: delete this block and the /lists rule below, and
                // drop the signup endpoint in AuthController.
                .requestMatchers(HttpMethod.GET, "/movies", "/movies/**").authenticated()
                .requestMatchers("/lists", "/lists/**").hasRole("ADMIN")
                // --- END tiered access -----------------------------------------------------

                .anyRequest().hasRole("ADMIN") // ROLE_ADMIN, as seeded by DataInitializer
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // No session will be created
            )
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class); // Execute JWT filter first

        return http.build();
    }
}
