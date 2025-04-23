package com.stuba.fei.reservation_system.repository.users;

import com.stuba.fei.reservation_system.model.users.EventOrganizer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EventOrganizerRepository extends JpaRepository<EventOrganizer, Long> {
    Optional<EventOrganizer> findByUsername(String username);
}