package com.stuba.fei.reservation_system.service;

import com.stuba.fei.reservation_system.model.Event;
import com.stuba.fei.reservation_system.model.EventStatus;
import com.stuba.fei.reservation_system.model.Reservation;
import com.stuba.fei.reservation_system.model.users.EventOrganizer;
import com.stuba.fei.reservation_system.repository.ReservationRepository;
import com.stuba.fei.reservation_system.service.users.EventOrganizerService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EventRatingService {
    private final ReservationRepository reservationRepository;
    private final EventOrganizerService eventOrganizerService;

    public EventRatingService(ReservationRepository reservationRepository, EventOrganizerService eventOrganizerService) {
        this.reservationRepository = reservationRepository;
        this.eventOrganizerService = eventOrganizerService;
    }

    @Transactional
    public Reservation rateEvent(Long userId, Event event, int rating) {
        if (rating < 0 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 0 and 5");
        }

        // Check if the event is inactive (completed)
        if (event.getStatus() != EventStatus.INACTIVE) {
            throw new IllegalStateException("Only inactive events can be rated");
        }

        // Find user's reservation for this event
        Optional<Reservation> existingReservation = reservationRepository.findByRegisteredUserIdAndEventId(userId, event.getId());
        
        if (existingReservation.isEmpty()) {
            throw new IllegalStateException("You can only rate events you have reserved");
        }

        // Update reservation with rating
        Reservation reservation = existingReservation.get();
        reservation.setRating(rating);
        Reservation savedReservation = reservationRepository.save(reservation);

        // Update the organizer's average rating
        updateOrganizerAverageRating(event.getEventOrganizer().getId());
        
        return savedReservation;
    }

    private void updateOrganizerAverageRating(Long organizerId) {
        List<Reservation> ratings = reservationRepository.findByEventOrganizerIdWithRating(organizerId);
        
        if (ratings.isEmpty()) {
            EventOrganizer organizer = eventOrganizerService.getEventOrganizerById(organizerId)
                    .orElseThrow(() -> new RuntimeException("EventOrganizer not found"));
            organizer.setAverageRating(null);
            eventOrganizerService.saveEventOrganizer(organizer);
        } else {
            double averageRating = ratings.stream()
                    .filter(r -> r.getRating() != null)
                    .mapToInt(Reservation::getRating)
                    .average()
                    .orElse(0.0);
            
            EventOrganizer organizer = eventOrganizerService.getEventOrganizerById(organizerId)
                    .orElseThrow(() -> new RuntimeException("EventOrganizer not found"));
            organizer.setAverageRating(averageRating);
            eventOrganizerService.saveEventOrganizer(organizer);
        }
    }

    public List<Reservation> getEventRatings(Long eventId) {
        return reservationRepository.findByEventIdWithRating(eventId);
    }

    /**
     * Get the average rating for an event
     * @param eventId the event ID
     * @return the average rating or 0 if no ratings
     */
    public double getAverageEventRating(Long eventId) {
        List<Reservation> ratings = reservationRepository.findByEventIdWithRating(eventId);
        if (ratings.isEmpty()) {
            return 0.0;
        }
        return ratings.stream()
                .filter(r -> r.getRating() != null)
                .mapToInt(Reservation::getRating)
                .average()
                .orElse(0.0);
    }

    /**
     * Get the number of ratings for an event
     * @param eventId the event ID
     * @return the count of ratings
     */
    public int getEventRatingCount(Long eventId) {
        List<Reservation> ratings = reservationRepository.findByEventIdWithRating(eventId);
        return (int) ratings.stream()
                .filter(r -> r.getRating() != null)
                .count();
    }

    /**
     * Get rating distribution for an event (how many users gave each star rating)
     * @param eventId the event ID
     * @return a map with rating values (1-5) as keys and counts as values
     */
    public Map<Integer, Long> getEventRatingDistribution(Long eventId) {
        List<Reservation> ratings = reservationRepository.findByEventIdWithRating(eventId);
        return ratings.stream()
                .filter(r -> r.getRating() != null)
                .collect(Collectors.groupingBy(
                        Reservation::getRating,
                        Collectors.counting()
                ));
    }

    /**
     * Get event rating data including average, count, and distribution
     * @param eventId the event ID
     * @return a map containing rating statistics
     */
    public Map<String, Object> getEventRatingStats(Long eventId) {
        double average = getAverageEventRating(eventId);
        int count = getEventRatingCount(eventId);
        Map<Integer, Long> distribution = getEventRatingDistribution(eventId);
        
        return Map.of(
            "average", average,
            "count", count,
            "distribution", distribution
        );
    }

    public Optional<Reservation> getUserRatingForEvent(Long userId, Long eventId) {
        return reservationRepository.findByRegisteredUserIdAndEventId(userId, eventId);
    }
}
