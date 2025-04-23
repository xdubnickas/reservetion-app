package com.stuba.fei.reservation_system.repository;

import com.stuba.fei.reservation_system.model.City;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CityRepository extends JpaRepository<City, Long> {

    // Metóda pre nájdenie mesta podľa názvu a krajiny (používa sa v CityService)
    Optional<City> findByNameAndCountry(String name, String country);

    City findByName(String bratislava);
}