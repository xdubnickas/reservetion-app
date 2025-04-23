package com.stuba.fei.reservation_system.repository;

import com.stuba.fei.reservation_system.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByEventOrganizerId(Long eventOrganizerId);
    List<Event> findByRooms_IdInAndEventDate(List<Long> roomIds, LocalDate eventDate);
    List<Event> findByEventDateGreaterThanEqualOrderByEventDateAsc(LocalDate date);
}
