package com.stuba.fei.reservation_system.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.stuba.fei.reservation_system.model.users.RegisteredUser;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@Entity
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDateTime reservationDate;

    @Enumerated(EnumType.STRING)
    private ReservationStatus status = ReservationStatus.CONFIRMED;

    private Integer rating; // Rating from 0-5 stars, null if not rated

    @JsonIgnore
    @ManyToOne(optional = false)
    private RegisteredUser registeredUser;

    @JsonIgnore
    @ManyToOne(optional = false)
    private Event event;

    public enum ReservationStatus {
        PENDING, CONFIRMED, CANCELLED
    }
}
