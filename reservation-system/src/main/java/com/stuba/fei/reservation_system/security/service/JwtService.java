package com.stuba.fei.reservation_system.security.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey secretKey =
            Keys.hmacShaKeyFor(("c69842dc604775506511bf6ad9a476d83e0bb86bf6638f15c64df542bec16c" +
                    "fe13fdd9730f4d2836144de5782ba1b12a109eadab94fa550eb39e1a056b7378bb").getBytes());  // Kľúč na generovanie tokenov

    // Generovanie tokenu
    public String generateJwtToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // Token expirovať po 24 hodinách
                .signWith(secretKey, SignatureAlgorithm.HS512)
                .compact();
    }

    // Validácia tokenu
    public boolean validateJwtToken(String token) {
        try {
            Jwts.parser().setSigningKey(secretKey).parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String extractUsername(String token) {
        String username = Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
        
        System.out.println("Username extracted from token: " + username);
        return username;
    }

}
