package com.stuba.fei.reservation_system.controller;

import com.stuba.fei.reservation_system.model.Event;
import com.stuba.fei.reservation_system.model.users.SpaceRenter;
import com.stuba.fei.reservation_system.repository.RoomRepository;
import com.stuba.fei.reservation_system.repository.users.EventOrganizerRepository;
import com.stuba.fei.reservation_system.service.EventService;
import com.stuba.fei.reservation_system.service.users.EventOrganizerService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.stuba.fei.reservation_system.repository.LocalityRepository;
import com.stuba.fei.reservation_system.handler.ResourceNotFoundException;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.List;
import com.stuba.fei.reservation_system.security.controller.UserRole;

@RestController
@RequestMapping("/api/events")
//@CrossOrigin(origins = "http://localhost:5173")
public class EventController {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final EventService eventService;
    private final LocalityRepository localityRepository;
    private final EventOrganizerService eventOrganizerService;
    private final EventOrganizerRepository eventOrganizerRepository;

    // Konštruktor pre injektovanie závislostí
    public EventController(EventService eventService, LocalityRepository localityRepository, EventOrganizerService eventOrganizerService, EventOrganizerRepository eventOrganizerRepository, RoomRepository roomRepository) {
        this.eventService = eventService;
        this.localityRepository = localityRepository;
        this.eventOrganizerService = eventOrganizerService;
        this.eventOrganizerRepository = eventOrganizerRepository;

    }

    // Získať všetky udalosti
    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Event>> getAllUpcomingEvents() {
        return ResponseEntity.ok(eventService.getUpcomingEvents());
    }

    // Vytvoriť novú udalosť s obrázkom
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    @PostMapping
    public ResponseEntity<Event> createEvent(
            @RequestParam("name") String name,                     // Názov udalosti
            @RequestParam(value = "description", required = false) String description,       // Popis udalosti
            @RequestParam("category") String category,             // Kategória udalosti
            @RequestParam("maxCapacity") int maxCapacity,                // Kapacita
            @RequestParam(value = "price", required = false) Double price,                   // Cena
            @RequestParam("eventDate") LocalDate eventDate,                     // Dátum udalosti
            @RequestParam("startTime") String timeStr,                     // Čas udalosti
            @RequestParam(value = "duration") Integer duration,
            @RequestParam(value = "image", required = false) MultipartFile image,              // Súbor, ktorý sa nahráva
            @RequestParam("roomIds") List<Long> roomIds           // Zoznam ID miestností           // ID lokality
    ) {
        System.out.println("Creating event with image " + name + " " + description + " " + category + " " + maxCapacity + " "
                + price + " " + eventDate + " " + timeStr + " " + roomIds);

        try {
            LocalTime time = LocalTime.parse(timeStr).truncatedTo(ChronoUnit.MINUTES);

            // Default hodnoty pre nepovinné parametre
            if (description == null) {
                description = "No description provided.";
            }
            if (price == null) {
                price = 0.0; // Predvolená cena
            }

            //LocalDate date = LocalDate.parse(eventDate);
            // Vytvor udalosť s obrázkom
            Event event = eventService.createEventWithImage(
                    image, name, description, category, maxCapacity, price, eventDate, time, duration, roomIds
            );

            return ResponseEntity.ok(event);  // Vráti úspešný response s udalosťou
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(null);  // Chyba pri ukladaní obrázka
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().build();
        }
    }


    // Získať jednu udalosť podľa ID
    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        return eventService.getEventById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    @PutMapping("/{eventId}")
    public ResponseEntity<?> updateEvent(
            @PathVariable Long eventId,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "maxCapacity", required = false) Integer maxCapacity,
            @RequestParam(value = "price", required = false) Double price,
            @RequestParam(value = "eventDate", required = false) LocalDate eventDate,
            @RequestParam(value = "startTime", required = false) String timeStr,
            @RequestParam(value = "duration", required = false) Integer duration,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "roomIds", required = false) List<Long> roomIds
    ) {
        System.out.println("Updating event with image " + name + " " + description + " " + category + " " + maxCapacity + " "
                + price + " " + eventDate + " " + timeStr + " " + roomIds);
        try {
            LocalTime time = null;
            if (timeStr != null) {
                time = LocalTime.parse(timeStr).truncatedTo(ChronoUnit.MINUTES);
            }
            Event updatedEvent = eventService.updateEventWithImage(
                    eventId,
                    image,
                    name,
                    description,
                    category,
                    maxCapacity,
                    price,
                    eventDate,
                    time,
                    duration,
                    roomIds
            );
            return ResponseEntity.ok(updatedEvent);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Chyba pri spracovaní obrázka");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        try {
            eventService.deleteEvent(id);
            return ResponseEntity.noContent().build();  // Vráti status 204
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Chyba pri mazaní obrázka alebo udalosti");  // Chyba pri mazaní obrázka alebo udalosti
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();  // Udalosť neexistuje
        }
    }

    // Upravený endpoint pre obsadené časy, s možnosťou vylúčiť editovanú udalosť
    @GetMapping("/occupied-times")
    public ResponseEntity<?> getOccupiedTimes(
            @RequestParam List<Long> roomIds,                  // Zoznam ID izieb
            @RequestParam String date,                         // Dátum vo formáte String
            @RequestParam(required = false) Long excludeEventId) {  // Voliteľný parameter pre ID udalosti, ktorú chceme vylúčiť

        try {
            // Validácia vstupov
            if (roomIds == null || roomIds.isEmpty()) {
                return ResponseEntity.badRequest().body("Chýbajúce roomIds");
            }

            LocalDate parsedDate = LocalDate.parse(date);
            List<LocalTime[]> occupiedTimes = eventService.getOccupiedTimes(roomIds, parsedDate, excludeEventId);
            return ResponseEntity.ok(occupiedTimes);

        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body("Neplatný formát dátumu. Použite yyyy-MM-dd.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Server error: " + e.getMessage());
        }
    }

    // Získať udalosti aktuálne prihláseného používateľa
    @GetMapping("/my")
    public ResponseEntity<List<Event>> getMyEvents() {
        try {
            List<Event> myEvents = eventService.getMyEvents();
            return ResponseEntity.ok(myEvents);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Upravený endpoint pre obsadené časy, s možnosťou vylúčiť editovanú udalosť
    @GetMapping("/suggested")
    public ResponseEntity<?> getSuggestedEvents(
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false) Double latitude) {

        try {
            List<Event> suggestedEvents = eventService.getSuggestedEvents(longitude, latitude);
            return ResponseEntity.ok(suggestedEvents);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching suggested events: " + e.getMessage());
        }
    }

}
