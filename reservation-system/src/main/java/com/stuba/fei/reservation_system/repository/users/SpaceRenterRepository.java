package com.stuba.fei.reservation_system.repository.users;

import com.stuba.fei.reservation_system.model.users.SpaceRenter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpaceRenterRepository extends JpaRepository<SpaceRenter, Long> {
    Optional<SpaceRenter> findByUsername(String username);
}