package com.stuba.fei.reservation_system.service;

import com.stuba.fei.reservation_system.handler.ResourceNotFoundException;
import com.stuba.fei.reservation_system.model.*;
import com.stuba.fei.reservation_system.model.dto.CityRequest;
import com.stuba.fei.reservation_system.model.dto.LocalityRequest;
import com.stuba.fei.reservation_system.model.users.Person;
import com.stuba.fei.reservation_system.model.users.SpaceRenter;
import com.stuba.fei.reservation_system.repository.EventRepository;
import com.stuba.fei.reservation_system.repository.LocalityRepository;
import com.stuba.fei.reservation_system.repository.users.PersonRepository;
import com.stuba.fei.reservation_system.repository.users.SpaceRenterRepository;
import com.stuba.fei.reservation_system.service.users.SpaceRenterService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.nio.file.AccessDeniedException;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LocalityService {

    private final LocalityRepository localityRepository;
    private final PersonRepository personRepository;
    private final EventRepository eventRepository;
    private final SpaceRenterRepository spaceRenterRepository;
    private final CityService cityService;
    private final SpaceRenterService spaceRenterService;


    public LocalityService(LocalityRepository localityRepository, PersonRepository personRepository, EventRepository eventRepository, SpaceRenterRepository spaceRenterRepository, CityService cityService, SpaceRenterService spaceRenterService) {
        this.localityRepository = localityRepository;
        this.personRepository = personRepository;
        this.eventRepository = eventRepository;
        this.spaceRenterRepository = spaceRenterRepository;
        this.cityService = cityService;
        this.spaceRenterService = spaceRenterService;
    }

    // Získať všetky lokality
    public List<Locality> getAllLocalities() {
        return localityRepository.findAll();
    }

    // Získať lokalitu podľa ID
    public Optional<Locality> getLocalityById(Long id) {
        return localityRepository.findById(id);
    }

    public List<Locality> getLocalitiesByUser(String username) {
        SpaceRenter spaceRenter = (SpaceRenter) personRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        return localityRepository.findBySpaceRenter(spaceRenter);
    }


    public Locality createLocality(LocalityRequest request) {
        // Validácia kapacity
        if (request.getTotalCapacity() <= 0) {
            throw new IllegalArgumentException("totalCapacity musí byť kladné číslo.");
        }

        // Získanie prihláseného SpaceRentera
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        SpaceRenter spaceRenter = spaceRenterService.getSpaceRenterByUsername(username);

        // Nájdenie alebo vytvorenie mesta
        City city = cityService.findOrCreateCity(
                request.getCity().getName(),
                request.getCity().getCountry()
        );

        // Vytvorenie lokality
        Locality locality = new Locality();
        locality.setName(request.getName());
        locality.setAddress(request.getAddress());
        locality.setTotalCapacity(request.getTotalCapacity());
        locality.setCity(city);
        locality.setSpaceRenter(spaceRenter); // Priradenie k prihlásenému SpaceRenterovi

        // Uloženie a predvolený priestor
        Locality savedLocality = localityRepository.save(locality);

        return savedLocality;
    }

    public Locality updateLocality(Long id, LocalityRequest request) throws AccessDeniedException {
        // Overenie existujúcej lokality
        Locality locality = localityRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Locality s ID " + id + " neexistuje."));

        // Autorizácia: Iba vlastník môže upravovať lokalitu
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        if (!locality.getSpaceRenter().getUsername().equals(username)) {
            throw new AccessDeniedException("Nemáte oprávnenie upravovať túto lokalitu.");
        }

        // Aktualizácia polí
        locality.setName(request.getName());
        locality.setAddress(request.getAddress());
        locality.setTotalCapacity(request.getTotalCapacity());

        // Aktualizácia mesta (ak sa zmenil name alebo country)
        CityRequest cityRequest = request.getCity();
        if (!isCitySame(locality.getCity(), cityRequest)) {
            City newCity = cityService.findOrCreateCity(cityRequest.getName(), cityRequest.getCountry());
            locality.setCity(newCity);
        }

        return localityRepository.save(locality);
    }

    private boolean isCitySame(City existingCity, CityRequest request) {
        return existingCity.getName().equals(request.getName()) &&
                existingCity.getCountry().equals(request.getCountry());
    }

    @Transactional
    public void deleteLocality(Long id) {

        Locality locality = localityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Locality with id " + id + " not found"));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        if (!(locality.getSpaceRenter().getUsername().equals(username))) {
            throw new AuthenticationException("You need to be authenticated to perform this action") {};
        }

        // Pre každú miestnosť odstráň jej väzby na udalosti
        for (Room room : locality.getRooms()) {
            List<Event> affectedEvents = room.getEvents();

            for (Event event : affectedEvents) {
                event.getRooms().remove(room);
                event.setStatus(EventStatus.INACTIVE);
            }

            room.getEvents().clear();
        }

        localityRepository.delete(locality); // automaticky zmaže aj rooms kvôli cascade = ALL
    }


    /**
     * Get all events associated with a specific locality
     * @param localityId The ID of the locality
     * @return List of events at the specified locality
     */
    public List<Event> getEventsByLocality(Long localityId) {
        // First verify that the locality exists
        Locality locality = localityRepository.findById(localityId)
                .orElseThrow(() -> new EntityNotFoundException("Locality with ID " + localityId + " not found"));
        
        // Get all events from the repository
        List<Event> allEvents = eventRepository.findAll();
        
        // Filter events to those containing rooms with the specified locality
        List<Event> localityEvents = allEvents.stream()
                .filter(event -> event.getRooms() != null && !event.getRooms().isEmpty())
                .filter(event -> event.getRooms().stream()
                        .anyMatch(room -> room.getLocality() != null && 
                                room.getLocality().getId().equals(localityId)))
                .collect(Collectors.toList());
        
        // Update status for all events and save if changed
        localityEvents.forEach(this::updateAndSaveEventStatus);
        
        // Sort events by date (soonest first)
        localityEvents.sort(Comparator.comparing(Event::getEventDate));
        
        return localityEvents;
    }

    /**
     * Get event counts for a specific locality
     * @param localityId The ID of the locality
     * @return Map containing counts of active and total events
     */
    public Map<String, Integer> getEventCountsByLocality(Long localityId) {
        // First verify that the locality exists
        Locality locality = localityRepository.findById(localityId)
                .orElseThrow(() -> new EntityNotFoundException("Locality with ID " + localityId + " not found"));
        
        // Get events for this locality - using the same method we use to display events
        List<Event> localityEvents = getEventsByLocality(localityId);
        
        // Events are already updated by getEventsByLocality
        
        // Count active events (those with ACTIVE status)
        long activeEventsCount = localityEvents.stream()
                .filter(event -> EventStatus.ACTIVE.equals(event.getStatus()))
                .count();
        
        Map<String, Integer> counts = new HashMap<>();
        counts.put("active", (int) activeEventsCount);
        counts.put("total", localityEvents.size());
        
        return counts;
    }
    
    /**
     * Helper method to update and save event status
     * @param event The event to update
     */
    private void updateAndSaveEventStatus(Event event) {
        EventStatus oldStatus = event.getStatus();
        event.updateStatus();
        // Only save if status has changed
        if (oldStatus != event.getStatus()) {
            eventRepository.save(event);
        }
    }
}
