package com.stuba.fei.reservation_system.service;

import com.stuba.fei.reservation_system.dto.UserPreferencesDTO;

public interface UserPreferencesService {
    
    /**
     * Get the preferences for a specific user
     * 
     * @param username The username of the user
     * @return The preferences of the user
     */
    UserPreferencesDTO getPreferencesForUser(String username);
    
    /**
     * Save preferences for a specific user
     * 
     * @param username The username of the user
     * @param preferences The preferences to save
     * @return The saved preferences
     */
    UserPreferencesDTO savePreferencesForUser(String username, UserPreferencesDTO preferences);
}
