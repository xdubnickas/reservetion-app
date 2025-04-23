package com.stuba.fei.reservation_system.service.users;

import com.stuba.fei.reservation_system.model.users.EventOrganizer;
import com.stuba.fei.reservation_system.repository.users.EventOrganizerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EventOrganizerService {
    private final EventOrganizerRepository eventOrganizerRepository;

    public EventOrganizerService(EventOrganizerRepository eventOrganizerRepository) {
        this.eventOrganizerRepository = eventOrganizerRepository;
    }

    // CREATE
    public EventOrganizer saveEventOrganizer(EventOrganizer eventOrganizer) {
        return eventOrganizerRepository.save(eventOrganizer);
    }

    // READ - All
    public List<EventOrganizer> getAllEventOrganizers() {
        return eventOrganizerRepository.findAll();
    }

    // READ - By ID
    public Optional<EventOrganizer> getEventOrganizerById(Long id) {
        return eventOrganizerRepository.findById(id);
    }
    
    // READ - By Username
    public EventOrganizer getEventOrganizerByUsername(String username) {
        return eventOrganizerRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("EventOrganizer with username '" + username + "' not found"));
    }

    // UPDATE
    public EventOrganizer updateEventOrganizer(Long id, EventOrganizer eventOrganizerDetails) {
        EventOrganizer eventOrganizer = getEventOrganizerById(id)
                .orElseThrow(() -> new RuntimeException("EventOrganizer with ID " + id + " not found"));

        // Only update fields that are provided in the request
        if (eventOrganizerDetails.getUsername() != null) {
            eventOrganizer.setUsername(eventOrganizerDetails.getUsername());
        }
        
        if (eventOrganizerDetails.getEmail() != null) {
            eventOrganizer.setEmail(eventOrganizerDetails.getEmail());
        }
        
        if (eventOrganizerDetails.getPassword() != null) {
            eventOrganizer.setPassword(eventOrganizerDetails.getPassword());
        }
        
        if (eventOrganizerDetails.getFirstName() != null) {
            eventOrganizer.setFirstName(eventOrganizerDetails.getFirstName());
        }
        
        if (eventOrganizerDetails.getLastName() != null) {
            eventOrganizer.setLastName(eventOrganizerDetails.getLastName());
        }
        
        if (eventOrganizerDetails.getMobilePhoneNumber() != null) {
            eventOrganizer.setMobilePhoneNumber(eventOrganizerDetails.getMobilePhoneNumber());
        }
        
        if (eventOrganizerDetails.getOrganizationName() != null) {
            eventOrganizer.setOrganizationName(eventOrganizerDetails.getOrganizationName());
        }
        
        if (eventOrganizerDetails.getAverageRating() != null) {
            eventOrganizer.setAverageRating(eventOrganizerDetails.getAverageRating());
        }

        return eventOrganizerRepository.save(eventOrganizer);
    }

    // DELETE
    public void deleteEventOrganizer(Long id) {
        if (!eventOrganizerRepository.existsById(id)) {
            throw new RuntimeException("EventOrganizer with ID " + id + " not found");
        }
        eventOrganizerRepository.deleteById(id);
    }
}
