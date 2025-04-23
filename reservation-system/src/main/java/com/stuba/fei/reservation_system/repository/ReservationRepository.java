package com.stuba.fei.reservation_system.repository;

import com.stuba.fei.reservation_system.model.Reservation;
import com.stuba.fei.reservation_system.model.Reservation.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByRegisteredUserId(Long userId);
    List<Reservation> findByEventId(Long eventId);
    long countByEventIdAndStatusNot(Long eventId, ReservationStatus status);
    boolean existsByRegisteredUserIdAndEventIdAndStatusNot(Long userId, Long eventId, ReservationStatus status);
    
    Optional<Reservation> findByRegisteredUserIdAndEventId(Long userId, Long eventId);
    
    @Query("SELECT r FROM Reservation r WHERE r.event.id = :eventId AND r.rating IS NOT NULL")
    List<Reservation> findByEventIdWithRating(@Param("eventId") Long eventId);
    
    @Query("SELECT r FROM Reservation r WHERE r.event.eventOrganizer.id = :organizerId AND r.rating IS NOT NULL")
    List<Reservation> findByEventOrganizerIdWithRating(@Param("organizerId") Long organizerId);
}
