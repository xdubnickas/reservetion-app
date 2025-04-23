package com.stuba.fei.reservation_system.controller;

import com.stuba.fei.reservation_system.model.Event;
import com.stuba.fei.reservation_system.model.Locality;
import com.stuba.fei.reservation_system.model.dto.LocalityRequest;
import com.stuba.fei.reservation_system.model.users.Person;
import com.stuba.fei.reservation_system.model.users.SpaceRenter;
import com.stuba.fei.reservation_system.repository.users.PersonRepository;
import com.stuba.fei.reservation_system.service.LocalityService;
import com.stuba.fei.reservation_system.service.users.SpaceRenterService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/localities")
public class LocalityController {

    private final LocalityService localityService;
    private final SpaceRenterService spaceRenterService;
    private final PersonRepository personRepository;

    // Constructor injection
    public LocalityController(LocalityService localityService, SpaceRenterService spaceRenterService, PersonRepository personRepository) {
        this.localityService = localityService;
        this.spaceRenterService = spaceRenterService;
        this.personRepository = personRepository;
    }

    // Získať všetky lokality
    @GetMapping
    public List<Locality> getAllLocalities() {
        return localityService.getAllLocalities();
    }
    // Získa všetky lokality daného užívateľa podľa username
    @GetMapping("/user/{username}")
    public ResponseEntity<List<Locality>> getLocalitiesByUsername(@PathVariable String username) {
        Optional<Person> person = personRepository.findByUsername(username);
        if (person.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Locality> localities = localityService.getLocalitiesByUser(person.get().getUsername());
        return ResponseEntity.ok(localities);
    }

    // Získať lokalitu podľa ID
    @GetMapping("/{id}")
    public ResponseEntity<Locality> getLocalityById(@PathVariable Long id) {
        Optional<Locality> locality = localityService.getLocalityById(id);
        return locality.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get events for a specific locality
    @GetMapping("/{id}/events")
    public ResponseEntity<?> getEventsByLocality(@PathVariable Long id) {
        try {
            List<Event> events = localityService.getEventsByLocality(id);
            return ResponseEntity.ok(events);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error fetching events for locality: " + e.getMessage()));
        }
    }
    
    // Get event counts for a specific locality
    @GetMapping("/{id}/event-counts")
    public ResponseEntity<?> getEventCountsByLocality(@PathVariable Long id) {
        try {
            Map<String, Integer> eventCounts = localityService.getEventCountsByLocality(id);
            return ResponseEntity.ok(eventCounts);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error fetching event counts for locality: " + e.getMessage()));
        }
    }

    @PreAuthorize("hasRole('SPACE_RENTER')")
    @PostMapping
    public ResponseEntity<?> createLocality(@Valid @RequestBody LocalityRequest request) {
        try {
            Locality locality = localityService.createLocality(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(locality);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PreAuthorize("hasRole('SPACE_RENTER')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateLocality(
            @PathVariable Long id,
            @Valid @RequestBody LocalityRequest request
    ) {
        try {
            Locality locality = localityService.updateLocality(id, request);
            return ResponseEntity.ok(locality);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (AccessDeniedException e) {  // <-- PRIDANÝ BLOK
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied: " + e.getMessage()));
        }
    }

    // Odstrániť lokalitu
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLocality(@PathVariable Long id) {
        localityService.deleteLocality(id);
        return ResponseEntity.noContent().build();  // Status 204

    }
}
