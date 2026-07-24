package com.raghav.rupaliconstbackend.filter;

import com.raghav.rupaliconstbackend.service.NormalUserJwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Authenticates public-user requests carrying a NORMAL_USER JWT and grants
 * ROLE_NORMAL_USER. Only wired into {@code NormalUserSecurityConfig}'s chain, so
 * it never touches admin routes. The authenticated principal is the user's email
 * (the token subject), which controllers read via the Authentication name.
 */
@Component
@RequiredArgsConstructor
public class NormalUserJwtFilter extends OncePerRequestFilter {
    private final NormalUserJwtService normalUserJwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (normalUserJwtService.isNormalUserToken(token)
                    && SecurityContextHolder.getContext().getAuthentication() == null) {
                String email = normalUserJwtService.extractUsername(token);
                if (email != null) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    email, null, List.of(new SimpleGrantedAuthority("ROLE_NORMAL_USER")));
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}
