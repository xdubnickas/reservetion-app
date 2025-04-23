package com.stuba.fei.reservation_system.controller;

import com.stuba.fei.reservation_system.model.Event;
import com.stuba.fei.reservation_system.model.Reservation;
import com.stuba.fei.reservation_system.model.users.EventOrganizer;
import com.stuba.fei.reservation_system.model.users.RegisteredUser;
import com.stuba.fei.reservation_system.service.EventRatingService;
import com.stuba.fei.reservation_system.service.EventService;
import com.stuba.fei.reservation_system.service.users.EventOrganizerService;
import com.stuba.fei.reservation_system.service.users.RegisteredUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ratings")
public class EventRatingController {
    private final EventRatingService eventRatingService;
    private final EventService eventService;
    private final RegisteredUserService registeredUserService;
    private final EventOrganizerService eventOrganizerService;

    public EventRatingController(EventRatingService eventRatingService, 
                                 EventService eventService,
                                 RegisteredUserService registeredUserService,
                                 EventOrganizerService eventOrganizerService) {
        this.eventRatingService = eventRatingService;
        this.eventService = eventService;
        this.registeredUserService = registeredUserService;
        this.eventOrganizerService = eventOrganizerService;
    }

    @PostMapping("/event/{eventId}")
    public ResponseEntity<?> rateEvent(
            @PathVariable Long eventId,
            @RequestBody Map<String, Integer> ratingData) {
        System.out.println("Received rating data: " + ratingData);
        try {
            // Get authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            RegisteredUser user = registeredUserService.getRegisteredUserByUsername(username);
            
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }
            
            int rating = ratingData.get("rating");
            Event event = eventService.getEventById(eventId)
                    .orElseThrow(() -> new RuntimeException("Event not found"));
                    
            Reservation savedReservation = eventRatingService.rateEvent(user.getId(), event, rating);
            return ResponseEntity.ok(Map.of(
                "id", savedReservation.getId(),
                "rating", savedReservation.getRating()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to save rating"));
        }
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<?> getEventAverageRating(@PathVariable Long eventId) {
        try {
            double average = eventRatingService.getAverageEventRating(eventId);
            int count = eventRatingService.getEventRatingCount(eventId);
            
            Map<String, Object> response = Map.of(
                "average", average,
                "count", count
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/event/{eventId}/stats")
    public ResponseEntity<?> getEventRatingStats(@PathVariable Long eventId) {
        try {
            Map<String, Object> stats = eventRatingService.getEventRatingStats(eventId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/event/{eventId}/user")
    public ResponseEntity<?> getUserRatingForEvent(@PathVariable Long eventId) {
        // Get authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        // Try to find user as RegisteredUser first
        RegisteredUser user = null;
        try {
            user = registeredUserService.getRegisteredUserByUsername(username);
        } catch (RuntimeException e) {
            // User not found as RegisteredUser
        }
        
        // If not a RegisteredUser, check if it's an EventOrganizer
        if (user == null) {
            try {
                EventOrganizer organizer = eventOrganizerService.getEventOrganizerByUsername(username);
                if (organizer != null) {
                    // Event organizers don't rate events, so return 0
                    return ResponseEntity.ok(Map.of("rating", 0));
                }
            } catch (RuntimeException e) {
                // Not an organizer either
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }
        }
        
        // If we have a valid user, get their rating
        if (user != null) {
            return eventRatingService.getUserRatingForEvent(user.getId(), eventId)
                    .map(reservation -> {
                        Integer rating = reservation.getRating();
                        return ResponseEntity.ok(Map.of("rating", rating != null ? rating : 0));
                    })
                    .orElse(ResponseEntity.ok(Map.of("rating", 0)));
        }
        
        return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
    }
}
