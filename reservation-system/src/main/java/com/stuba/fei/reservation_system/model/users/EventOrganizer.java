package com.stuba.fei.reservation_system.model.users;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.stuba.fei.reservation_system.model.Event;
import com.stuba.fei.reservation_system.model.Locality;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
public class EventOrganizer extends Person {
    @Column(nullable = false)
    private String mobilePhoneNumber;

    @Column(nullable = false)
    private String organizationName;

    @Column
    private Double averageRating;

    @OneToMany(mappedBy = "eventOrganizer", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"eventOrganizer"})
    private List<Event> events;


}
