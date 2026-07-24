package com.raghav.rupaliconstbackend.service;

import com.raghav.rupaliconstbackend.entity.NormalUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

/**
 * Issues and verifies JWTs for public ("normal") users. Deliberately separate
 * from the admin {@link JwtService}: tokens carry a {@code type=NORMAL_USER}
 * claim so an admin token can never be replayed against the public endpoints
 * and vice-versa, even though both are signed with the same secret.
 */
@Service
public class NormalUserJwtService {
    public static final String TOKEN_TYPE = "NORMAL_USER";

    private final SecretKey secretKey;
    private final long expirationMs;

    public NormalUserJwtService(@Value("${app.jwt.secret}") String secret,
                                @Value("${app.jwt.normal-user-expiration-ms:604800000}") long expirationMs) {
        this.secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        this.expirationMs = expirationMs;
    }

    public String generateToken(NormalUser user) {
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("type", TOKEN_TYPE)
                .claim("uid", user.getId())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(secretKey)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /** True only for a well-formed, unexpired, NORMAL_USER-typed token. */
    public boolean isNormalUserToken(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return TOKEN_TYPE.equals(claims.get("type", String.class))
                    && claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimResolver) {
        return claimResolver.apply(extractAllClaims(token));
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
