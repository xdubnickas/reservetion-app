package com.stuba.fei.reservation_system.dto;

import java.util.Arrays;

public class UserPreferencesDTO {
    
    private String city;
    private int[] priceRange;
    private String category;
    
    // Default constructor
    public UserPreferencesDTO() {
    }
    
    // Constructor with fields
    public UserPreferencesDTO(String city, int[] priceRange, String category) {
        this.city = city;
        this.priceRange = priceRange;
        this.category = category;
    }
    
    // Getters and Setters
    public String getCity() {
        return city;
    }
    
    public void setCity(String city) {
        this.city = city;
    }
    
    public int[] getPriceRange() {
        return priceRange;
    }
    
    public void setPriceRange(int[] priceRange) {
        this.priceRange = priceRange;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    @Override
    public String toString() {
        return "UserPreferencesDTO{" +
                "city='" + city + '\'' +
                ", priceRange=" + Arrays.toString(priceRange) +
                ", category='" + category + '\'' +
                '}';
    }
}
