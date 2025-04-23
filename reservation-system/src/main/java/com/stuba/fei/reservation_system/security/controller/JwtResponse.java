package com.stuba.fei.reservation_system.security.controller;


import jakarta.annotation.security.DenyAll;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;

@Data
public class JwtResponse {
    private String token;
    @Enumerated(EnumType.STRING)
    private UserRole role;

    public JwtResponse(String token,UserRole role) {
        this.token = token;
        this.role = role;
    }
}
