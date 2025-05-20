package com.fitconnect.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Für API-Aufrufe über Postman/curl deaktivieren
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll() // Offen für Registrierung & Login
                .anyRequest().authenticated()            // Alles andere geschützt
            )
            .httpBasic(Customizer.withDefaults());       // Optional für Testing via Browser

        return http.build();
    }
}
