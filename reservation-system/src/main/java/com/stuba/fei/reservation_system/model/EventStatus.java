package com.stuba.fei.reservation_system.model;

public enum EventStatus {
    ACTIVE,   // Event is active and accepting reservations
    FULL,     // Event has reached maximum capacity
    INACTIVE  // Event date has passed or is otherwise not active
}
