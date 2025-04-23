package com.stuba.fei.reservation_system.controller.users;

import com.stuba.fei.reservation_system.model.users.EventOrganizer;
import com.stuba.fei.reservation_system.service.users.EventOrganizerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/event-organizers")
public class EventOrganizerController {
    private final EventOrganizerService eventOrganizerService;

    public EventOrganizerController(EventOrganizerService eventOrganizerService) {
        this.eventOrganizerService = eventOrganizerService;
    }

    @PostMapping
    public ResponseEntity<EventOrganizer> createEventOrganizer(@RequestBody EventOrganizer eventOrganizer) {
        return ResponseEntity.ok(eventOrganizerService.saveEventOrganizer(eventOrganizer));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventOrganizer> getEventOrganizerById(@PathVariable Long id) {
        return eventOrganizerService.getEventOrganizerById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/username/{username}")
    public ResponseEntity<EventOrganizer> getEventOrganizerByUsername(@PathVariable String username) {
        try {
            EventOrganizer eventOrganizer = eventOrganizerService.getEventOrganizerByUsername(username);
            return ResponseEntity.ok(eventOrganizer);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<EventOrganizer>> getAllEventOrganizers() {
        return ResponseEntity.ok(eventOrganizerService.getAllEventOrganizers());
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventOrganizer> updateEventOrganizer(
            @PathVariable Long id,
            @RequestBody EventOrganizer updatedEventOrganizer
    ) {
        try {
            EventOrganizer updated = eventOrganizerService.updateEventOrganizer(id, updatedEventOrganizer);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/username/{username}")
    public ResponseEntity<EventOrganizer> updateEventOrganizerByUsername(
            @PathVariable String username,
            @RequestBody EventOrganizer updatedEventOrganizer
    ) {
        try {
            EventOrganizer eventOrganizer = eventOrganizerService.getEventOrganizerByUsername(username);
            EventOrganizer updated = eventOrganizerService.updateEventOrganizer(eventOrganizer.getId(), updatedEventOrganizer);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            System.out.println(e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEventOrganizer(@PathVariable Long id) {
        try {
            eventOrganizerService.deleteEventOrganizer(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
