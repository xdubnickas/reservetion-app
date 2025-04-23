package com.stuba.fei.reservation_system.model.users;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.stuba.fei.reservation_system.model.Locality;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.Setter;


import java.util.List;

@Entity
@Getter
@Setter
public class SpaceRenter extends Person {
    @Column(nullable = false)
    private String mobilePhoneNumber;

    @OneToMany(mappedBy = "spaceRenter", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"spaceRenter"})
    private List<Locality> localities;
}

