package com.stuba.fei.reservation_system.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Entity
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Integer floor;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @JsonIgnoreProperties({"rooms"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "locality_id", nullable = false)
    private Locality locality;

    @ManyToMany(mappedBy = "rooms")
    @JsonIgnore
    private List<Event> events;

}