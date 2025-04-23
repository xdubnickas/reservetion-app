package com.stuba.fei.reservation_system.service;

import com.stuba.fei.reservation_system.dto.UserPreferencesDTO;
import com.stuba.fei.reservation_system.model.City;
import com.stuba.fei.reservation_system.model.users.RegisteredUser;
import com.stuba.fei.reservation_system.repository.users.RegisteredUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserPreferencesServiceImpl implements UserPreferencesService {

    private final RegisteredUserRepository userRepository;
    private final CityService cityService;

    @Autowired
    public UserPreferencesServiceImpl(
            RegisteredUserRepository userRepository,
            CityService cityService) {
        this.userRepository = userRepository;
        this.cityService = cityService;
    }

    @Override
    public UserPreferencesDTO getPreferencesForUser(String username) {
        RegisteredUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        return convertToDto(user);
    }

    @Override
    @Transactional
    public UserPreferencesDTO savePreferencesForUser(String username, UserPreferencesDTO preferencesDTO) {
        RegisteredUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        // Handle city if provided
        if (preferencesDTO.getCity() != null && !preferencesDTO.getCity().isEmpty()) {
            // Parse city name and country from format "CityName, Country"
            String[] cityParts = preferencesDTO.getCity().split(",");
            if (cityParts.length >= 2) {
                String cityName = cityParts[0].trim();
                String country = cityParts[1].trim();
                
                // Use findOrCreateCity from CityService
                City city = cityService.findOrCreateCity(cityName, country);
                user.setPrefferedCity(city);
            } else {
                // If format is incorrect, just store null
                user.setPrefferedCity(null);
            }
        } else {
            user.setPrefferedCity(null);
        }
        
        // Handle price range if provided
        if (preferencesDTO.getPriceRange() != null && preferencesDTO.getPriceRange().length >= 2) {
            user.setMinPrice(preferencesDTO.getPriceRange()[0]);
            user.setMaxPrice(preferencesDTO.getPriceRange()[1]);
        } else {
            user.setMinPrice(null);
            user.setMaxPrice(null);
        }
        
        // Handle category if provided
        user.setPreferredCategory(preferencesDTO.getCategory());
        
        // Save and return
        RegisteredUser savedUser = userRepository.save(user);
        return convertToDto(savedUser);
    }
    
    private UserPreferencesDTO convertToDto(RegisteredUser user) {
        UserPreferencesDTO dto = new UserPreferencesDTO();
        
        // Set city if available
        if (user.getPrefferedCity() != null) {
            dto.setCity(user.getPrefferedCity().getName() + ", " + user.getPrefferedCity().getCountry());
        }
        
        // Set price range if available
        if (user.getMinPrice() != null && user.getMaxPrice() != null) {
            dto.setPriceRange(new int[] { user.getMinPrice(), user.getMaxPrice() });
        }
        
        // Set category if available
        dto.setCategory(user.getPreferredCategory());
        
        return dto;
    }
}
