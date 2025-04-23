package com.stuba.fei.reservation_system.model.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LocalityRequest {
    private String name;
    private String address;
    private int totalCapacity;
    private CityRequest city;

}

