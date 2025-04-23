package com.stuba.fei.reservation_system.service;

import com.stuba.fei.reservation_system.dto.ReservationRequest;
import com.stuba.fei.reservation_system.dto.ReservationResponse;
import com.stuba.fei.reservation_system.model.Event;
import com.stuba.fei.reservation_system.model.EventStatus;
import com.stuba.fei.reservation_system.model.Reservation;
import com.stuba.fei.reservation_system.model.Reservation.ReservationStatus;
import com.stuba.fei.reservation_system.model.users.RegisteredUser;
import com.stuba.fei.reservation_system.repository.EventRepository;
import com.stuba.fei.reservation_system.repository.ReservationRepository;
import com.stuba.fei.reservation_system.repository.users.RegisteredUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final RegisteredUserRepository userRepository;
    private final EventRepository eventRepository;

    @Autowired
    public ReservationService(ReservationRepository reservationRepository, 
                              RegisteredUserRepository userRepository,
                              EventRepository eventRepository) {
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
    }

    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    public Optional<Reservation> getReservationById(Long id) {
        return reservationRepository.findById(id);
    }

    public List<Reservation> getReservationsByUser() {
        // Get the authenticated user from Security Context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        // Fetch user by username
        RegisteredUser user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
            
        // Return all reservations for the user
        return reservationRepository.findByRegisteredUserId(user.getId());
    }
    
    public List<ReservationResponse> getUserReservationsWithDetails() {
        List<Reservation> reservations = getReservationsByUser();
        return reservations.stream()
            .map(ReservationResponse::fromReservation)
            .toList();
    }

    public List<Reservation> getReservationsByEventId(Long eventId) {
        return reservationRepository.findByEventId(eventId);
    }

    public ReservationResponse createReservationForLoggedUser(ReservationRequest reservationRequest) {
        // Get the authenticated user from Security Context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        // Fetch user by username
        RegisteredUser user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
            
        // Fetch the event
        Event event = eventRepository.findById(reservationRequest.getEventId())
            .orElseThrow(() -> new RuntimeException("Event not found"));
        
        // Check if event is INACTIVE or FULL
        if (event.getStatus() == EventStatus.INACTIVE) {
            throw new RuntimeException("Cannot reserve an inactive event");
        }
        
        if (event.getStatus() == EventStatus.FULL) {
            throw new RuntimeException("Cannot reserve a fully booked event");
        }
        
        // Create a new reservation
        Reservation reservation = new Reservation();
        reservation.setEvent(event);
        reservation.setRegisteredUser(user);
        reservation.setReservationDate(LocalDateTime.now());
        
        // Check capacity
        long existingReservations = reservationRepository.countByEventIdAndStatusNot(
            event.getId(), ReservationStatus.CANCELLED);
        
        if (existingReservations >= event.getMaxCapacity()) {
            // Update event status to FULL if it reaches capacity
            event.setStatus(EventStatus.FULL);
            eventRepository.save(event);
            throw new RuntimeException("Event is fully booked");
        }
        
        // Check for existing reservation
        boolean hasReservation = reservationRepository.existsByRegisteredUserIdAndEventIdAndStatusNot(
            user.getId(), event.getId(), ReservationStatus.CANCELLED);
            
        if (hasReservation) {
            throw new RuntimeException("You already have a reservation for this event");
        }
        
        // Save the reservation
        Reservation savedReservation = reservationRepository.save(reservation);
        
        // Convert to response DTO
        return ReservationResponse.fromReservation(savedReservation);
    }

    public Reservation updateReservation(Long id, Reservation reservationDetails) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        // Only update references if provided
        if (reservationDetails.getRegisteredUser() != null && reservationDetails.getRegisteredUser().getId() != null) {
            RegisteredUser user = userRepository.findById(reservationDetails.getRegisteredUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
            reservation.setRegisteredUser(user);
        }
        
        if (reservationDetails.getEvent() != null && reservationDetails.getEvent().getId() != null) {
            Event event = eventRepository.findById(reservationDetails.getEvent().getId())
                .orElseThrow(() -> new RuntimeException("Event not found"));
            reservation.setEvent(event);
        }

        return reservationRepository.save(reservation);
    }

    public void deleteReservation(Long id) {
        reservationRepository.deleteById(id);
    }

    public ReservationResponse cancelReservation(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        // Check if reservation belongs to the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        RegisteredUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
                
        if (!reservation.getRegisteredUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only cancel your own reservations");
        }
        
        // Check if already cancelled
        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new RuntimeException("Reservation is already cancelled");
        }
        
        // Update status to CANCELLED
        reservation.setStatus(ReservationStatus.CANCELLED);
        Reservation savedReservation = reservationRepository.save(reservation);
        
        return ReservationResponse.fromReservation(savedReservation);
    }
}
