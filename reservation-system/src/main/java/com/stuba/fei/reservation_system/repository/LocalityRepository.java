package com.stuba.fei.reservation_system.repository;

import com.stuba.fei.reservation_system.model.Locality;
import com.stuba.fei.reservation_system.model.users.SpaceRenter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocalityRepository extends JpaRepository<Locality, Long> {
    List<Locality> findBySpaceRenter(SpaceRenter spaceRenter);  // Použi správny názov
}
