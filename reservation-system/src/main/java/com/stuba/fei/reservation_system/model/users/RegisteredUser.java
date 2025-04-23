package com.stuba.fei.reservation_system.model.users;

import com.stuba.fei.reservation_system.model.City;
import com.stuba.fei.reservation_system.model.Reservation;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Column;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Entity
public class RegisteredUser extends Person {

    @OneToMany(mappedBy = "registeredUser")
    private List<Reservation> reservations;

    @ManyToOne
    private City prefferedCity;
    
    @Column(name = "min_price")
    private Integer minPrice;
    
    @Column(name = "max_price")
    private Integer maxPrice;
    
    @Column(name = "preferred_category", length = 50)
    private String preferredCategory;
}
