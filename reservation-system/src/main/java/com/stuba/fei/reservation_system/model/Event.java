package com.stuba.fei.reservation_system.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.stuba.fei.reservation_system.model.users.EventOrganizer;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Setter
@Getter
@Entity
@Table(name = "event")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;
    private String description;
    @Column(nullable = false)
    private int maxCapacity;
    //private int occupiedCapacity = 0;
    private String category;
    @Column(nullable = false)
    private Double price;

    @Column(name = "date", nullable = false)
    private LocalDate eventDate;

    @Column(name = "time", nullable = false)
    @JsonFormat(pattern = "HH:mm")  // Pridáme formátovanie pre JSON
    private LocalTime startTime;

    @Column(name = "duration", nullable = false) // trvanie v minútach
    private int duration;

    @Column(name = "image_path")
    private String imagePath;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private EventStatus status = EventStatus.ACTIVE; // Default to ACTIVE

    @ManyToMany
    @JoinTable(
            name = "event_rooms",
            joinColumns = @JoinColumn(name = "event_id"),
            inverseJoinColumns = @JoinColumn(name = "room_id")
    )
    private List<Room> rooms;  // Udalosť môže mať viacero miestností

    @ManyToOne
    @JoinColumn(name = "event_organizer_id", nullable = false)
    @JsonIgnoreProperties({"events"})
    private EventOrganizer eventOrganizer;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Reservation> reservations;

    public LocalTime getEndTime() {
        return startTime.plusMinutes(duration);
    }

    public void updateStatus() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime eventStart = LocalDateTime.of(eventDate, startTime);

        // Ak rezervácie naplnili kapacitu → nastavíme FULL
        // Count only CONFIRMED reservations
        long confirmedReservations = reservations != null ? 
            reservations.stream()
                .filter(r -> r.getStatus() == Reservation.ReservationStatus.CONFIRMED)
                .count() : 0;
                
        if (confirmedReservations >= maxCapacity) {
            this.status = EventStatus.FULL;
            return;
        }

        // Ak už uplynul dátum a čas udalosti → nastavíme INACTIVE
        if (eventStart.isBefore(now)) {
            this.status = EventStatus.INACTIVE;
            return;
        }

        // Inak ostane ACTIVE
        this.status = EventStatus.ACTIVE;
    }

}
