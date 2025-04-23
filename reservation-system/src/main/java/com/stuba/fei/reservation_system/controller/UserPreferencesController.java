package com.stuba.fei.reservation_system.controller;

import com.stuba.fei.reservation_system.dto.UserPreferencesDTO;
import com.stuba.fei.reservation_system.service.UserPreferencesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/preferences")
public class UserPreferencesController {

    private final UserPreferencesService userPreferencesService;

    @Autowired
    public UserPreferencesController(UserPreferencesService userPreferencesService) {
        this.userPreferencesService = userPreferencesService;
    }

    @GetMapping
    public ResponseEntity<UserPreferencesDTO> getUserPreferences() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        UserPreferencesDTO preferences = userPreferencesService.getPreferencesForUser(username);
        return ResponseEntity.ok(preferences);
    }

    @PostMapping
    public ResponseEntity<UserPreferencesDTO> saveUserPreferences(@RequestBody UserPreferencesDTO preferences) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        UserPreferencesDTO savedPreferences = userPreferencesService.savePreferencesForUser(username, preferences);
        return ResponseEntity.ok(savedPreferences);
    }
}
