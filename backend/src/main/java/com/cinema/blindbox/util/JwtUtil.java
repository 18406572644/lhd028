package com.cinema.blindbox.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-token-expiration}")
    private long accessTokenExpiration;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    private volatile String currentSecret = null;

    private String getEffectiveSecret() {
        if (currentSecret != null) {
            return currentSecret;
        }
        return secret;
    }

    public void rotateSecret(String newSecret) {
        this.currentSecret = newSecret;
    }

    public String generateAccessToken(Long userId, String username) {
        return JWT.create()
                .withClaim("userId", userId)
                .withClaim("username", username)
                .withClaim("type", "access")
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + accessTokenExpiration))
                .sign(Algorithm.HMAC256(getEffectiveSecret()));
    }

    public String generateRefreshToken(Long userId, String username) {
        return JWT.create()
                .withClaim("userId", userId)
                .withClaim("username", username)
                .withClaim("type", "refresh")
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .sign(Algorithm.HMAC256(getEffectiveSecret()));
    }

    public DecodedJWT verifyAccessToken(String token) throws JWTVerificationException {
        JWTVerifier verifier = JWT.require(Algorithm.HMAC256(getEffectiveSecret())).build();
        DecodedJWT jwt = verifier.verify(token);
        if (!"access".equals(jwt.getClaim("type").asString())) {
            throw new JWTVerificationException("Invalid token type");
        }
        return jwt;
    }

    public DecodedJWT verifyRefreshToken(String token) throws JWTVerificationException {
        JWTVerifier verifier = JWT.require(Algorithm.HMAC256(getEffectiveSecret())).build();
        DecodedJWT jwt = verifier.verify(token);
        if (!"refresh".equals(jwt.getClaim("type").asString())) {
            throw new JWTVerificationException("Invalid token type");
        }
        return jwt;
    }

    public DecodedJWT verifyToken(String token) throws JWTVerificationException {
        JWTVerifier verifier = JWT.require(Algorithm.HMAC256(getEffectiveSecret())).build();
        return verifier.verify(token);
    }

    public Long getUserId(String token) {
        DecodedJWT jwt = verifyToken(token);
        return jwt.getClaim("userId").asLong();
    }

    public String getUsername(String token) {
        DecodedJWT jwt = verifyToken(token);
        return jwt.getClaim("username").asString();
    }

    public String getTokenType(String token) {
        DecodedJWT jwt = verifyToken(token);
        return jwt.getClaim("type").asString();
    }
}
