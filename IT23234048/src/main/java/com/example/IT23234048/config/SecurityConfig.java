package com.example.IT23234048.config;

import com.example.IT23234048.auth.security.JwtAuthenticationFilter;
import com.example.IT23234048.auth.security.OAuth2SuccessHandler;
import com.example.IT23234048.auth.security.HttpCookieOAuth2AuthorizationRequestRepository;
import com.example.IT23234048.auth.service.CustomOAuth2UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;
    private final String googleClientId;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            CustomOAuth2UserService customOAuth2UserService,
            OAuth2SuccessHandler oAuth2SuccessHandler,
            HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository,
            @Value("${spring.security.oauth2.client.registration.google.client-id:}") String googleClientId
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.customOAuth2UserService = customOAuth2UserService;
        this.oAuth2SuccessHandler = oAuth2SuccessHandler;
        this.httpCookieOAuth2AuthorizationRequestRepository = httpCookieOAuth2AuthorizationRequestRepository;
        this.googleClientId = googleClientId;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/oauth2/**", "/login/**", "/api/auth/register", "/api/auth/login", "/api/auth/make-me-admin", "/error", "/ws/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
                        .requestMatchers("/api/notifications/**").hasAnyRole("USER", "ADMIN", "TECHNICIAN", "MANAGER")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/maintenance/**").hasAnyRole("TECHNICIAN", "ADMIN")
                        .requestMatchers("/api/management/**").hasAnyRole("MANAGER", "ADMIN")
                        .requestMatchers("/api/user/**").hasAnyRole("USER", "ADMIN", "TECHNICIAN", "MANAGER")
                        // keep existing endpoints usable; treat as user endpoints by default
                        .requestMatchers("/api/resources/**").hasAnyRole("USER", "ADMIN", "TECHNICIAN", "MANAGER")
                        .requestMatchers("/api/v1/**").permitAll()
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(401);
                            response.getWriter().write("Unauthorized");
                        })
                );

        if (StringUtils.hasText(googleClientId)) {
            http.oauth2Login(oauth2 -> oauth2
                    .authorizationEndpoint(auth -> auth
                            .baseUri("/oauth2/authorization")
                            .authorizationRequestRepository(httpCookieOAuth2AuthorizationRequestRepository)
                    )
                    .userInfoEndpoint(userInfo -> userInfo.oidcUserService(customOAuth2UserService))
                    .successHandler(oAuth2SuccessHandler)
                    .failureHandler((request, response, exception) -> {
                        log.error("OAuth2 login failure: {}", exception.getMessage(), exception);
                        response.sendRedirect("http://localhost:5173/login?error=" +
                                java.net.URLEncoder.encode("Authentication failed. Please try again.", java.nio.charset.StandardCharsets.UTF_8));
                    })
            );
        }

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

}
