package com.stuba.fei.reservation_system.service;

import com.stuba.fei.reservation_system.model.City;
import com.stuba.fei.reservation_system.repository.CityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Arrays;
import java.util.Map;
import java.util.logging.Logger;

@Service
@RequiredArgsConstructor
public class CityService {
    private static final Logger logger = Logger.getLogger(CityService.class.getName());
    private final CityRepository cityRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String NOMINATIM_API_URL = "https://nominatim.openstreetmap.org/search";

    public City findOrCreateCity(String name, String country) {
        if (name == null || country == null) {
            throw new IllegalArgumentException("City name and country cannot be null");
        }
        
        // Try to find the city first
        return cityRepository.findByNameAndCountry(name, country)
                .orElseGet(() -> {
                    // Create a new city if not found
                    logger.info("Creating new city: " + name + ", " + country);
                    City newCity = new City();
                    newCity.setName(name);
                    newCity.setCountry(country);

                    // Fetch coordinates from OSM Nominatim API
                    Map<String, Double> coordinates = getCoordinatesFromApi(name, country);
                    newCity.setLongitude(coordinates.get("longitude"));
                    newCity.setLatitude(coordinates.get("latitude"));

                    logger.info("Coordinates: " + newCity.getLongitude() + ", " + newCity.getLatitude());
                    return cityRepository.save(newCity);
                });
    }

    private Map<String, Double> getCoordinatesFromApi(String city, String country) {
        try {
            // Build the request URL with parameters
            String requestUrl = UriComponentsBuilder.fromHttpUrl(NOMINATIM_API_URL)
                    .queryParam("q", city + "," + country)
                    .queryParam("format", "json")
                    .queryParam("limit", "1")
                    .build()
                    .toUriString();

            // Make the API request
            @SuppressWarnings("unchecked")
            Map<String, Object>[] response = restTemplate.getForObject(requestUrl, Map[].class);

            // Check if we got results
            if (response != null && response.length > 0) {
                Double lat = Double.parseDouble((String) response[0].get("lat"));
                Double lon = Double.parseDouble((String) response[0].get("lon"));
                return Map.of("latitude", lat, "longitude", lon);
            }
        } catch (Exception e) {
            logger.severe("Error fetching coordinates: " + e.getMessage());
        }
        
        // Return null values if the API call fails
        return Map.of("latitude", null, "longitude", null);
    }
}