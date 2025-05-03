package com.stuba.fei.reservation_system.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.stuba.fei.reservation_system.model.users.SpaceRenter;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
//@JsonIgnoreProperties({"spaceRenter"})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Locality {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private String address;
    @Column(nullable = false)
    @Min(value = 1, message = "Total capacity must be at least 1")
    private int totalCapacity;

    @ManyToOne
    @JoinColumn(name = "city_id", nullable = false)
    private City city;

    @ManyToOne
    @JoinColumn(name = "space_renter_id", nullable = false)
    @JsonIgnoreProperties({"localities"})
    private SpaceRenter spaceRenter; // Každá lokalita je priradená k jednému SpaceRenterovi

    @OneToMany(mappedBy = "locality", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Room> rooms;

    @PrePersist
    private void createDefaultRoom() {
        if (rooms == null) {
            rooms = new ArrayList<>();
        }
        Room defaultRoom = new Room();
        defaultRoom.setName("Main Hall");
        // Only enforce minimum if totalCapacity is invalid
        defaultRoom.setCapacity(totalCapacity < 1 ? 1 : totalCapacity);
        defaultRoom.setFloor(0);
        defaultRoom.setLocality(this);
        rooms.add(defaultRoom);
    }

}
