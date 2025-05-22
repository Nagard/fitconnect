package com.fitconnect.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
   
        .authorizeHttpRequests(auth -> auth
        .requestMatchers("/auth/**", "/activities/feed-stream").permitAll()
        .requestMatchers("/activities/**").authenticated()
        .requestMatchers("/friends/**").authenticated()
        .requestMatchers("/users/search").authenticated()
        .requestMatchers("/messages/**").authenticated()
        .requestMatchers("/groups/**").authenticated()
        .requestMatchers("/group-messages/**").authenticated()
        
        .anyRequest().denyAll()
)
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
        .httpBasic(Customizer.withDefaults());

    return http.build();
}
}
