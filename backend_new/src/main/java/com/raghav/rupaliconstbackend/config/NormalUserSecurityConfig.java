package com.raghav.rupaliconstbackend.config;

import com.raghav.rupaliconstbackend.filter.NormalUserJwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Dedicated security chain for the public ("normal user") API. Scoped to
 * {@code /normal-user/**} via {@link HttpSecurity#securityMatcher} and given the
 * highest precedence (@Order(1)) so it fully owns those paths — the existing
 * admin {@code SpringSecurityConfig} chain is left completely untouched and never
 * evaluates them.
 *
 * register/login are public; everything else under the prefix (me) requires a
 * valid NORMAL_USER token.
 */
@Configuration
@RequiredArgsConstructor
@Order(1)
public class NormalUserSecurityConfig {
    private final NormalUserJwtFilter normalUserJwtFilter;

    @Bean
    public SecurityFilterChain normalUserSecurityFilterChain(HttpSecurity http) throws Exception {
        return http
                .securityMatcher("/normal-user/**")
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(request ->
                        request.requestMatchers("/normal-user/register", "/normal-user/login").permitAll()
                                .anyRequest().hasRole("NORMAL_USER"))
                .sessionManagement(sm ->
                        sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(normalUserJwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
