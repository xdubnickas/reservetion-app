package com.stuba.fei.reservation_system.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReservationRequest {
    private Long eventId;
    private String name; // Optional, can be null
}
