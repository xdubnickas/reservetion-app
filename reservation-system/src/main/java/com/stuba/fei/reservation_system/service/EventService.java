package com.stuba.fei.reservation_system.service;

import com.stuba.fei.reservation_system.handler.ResourceNotFoundException;
import com.stuba.fei.reservation_system.model.Event;
import com.stuba.fei.reservation_system.model.EventStatus;
import com.stuba.fei.reservation_system.model.Room;
import com.stuba.fei.reservation_system.model.users.EventOrganizer;
import com.stuba.fei.reservation_system.model.users.RegisteredUser;
import com.stuba.fei.reservation_system.repository.EventRepository;
import com.stuba.fei.reservation_system.repository.LocalityRepository;
import com.stuba.fei.reservation_system.repository.RoomRepository;
import com.stuba.fei.reservation_system.repository.users.RegisteredUserRepository;
import com.stuba.fei.reservation_system.service.users.EventOrganizerService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.Map;
import java.util.Comparator;
import java.util.ArrayList;
import java.util.Objects;
import java.util.HashSet;
import com.stuba.fei.reservation_system.repository.CityRepository;
import com.stuba.fei.reservation_system.model.City;
import com.stuba.fei.reservation_system.model.Reservation;

@Service
public class EventService {
    @Autowired
    private EventRepository eventRepository;
    @Autowired
    private LocalityRepository localityRepository;
    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private RegisteredUserRepository registeredUserRepository;
    @Autowired
    private EventOrganizerService eventOrganizerService;
    @Autowired
    private CityRepository cityRepository;

    private static final String UPLOAD_DIR = "uploaded-images/";
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    // Configurable weights for scoring factors
    private static final double WEIGHT_SAME_CITY = 0.5;
    private static final double WEIGHT_DISTANCE = 0.35;
    private static final double WEIGHT_FREE_EVENT = 0.1;
    private static final double WEIGHT_AVAILABILITY = 0.05;

    // Configurable weights for registered user scoring factors
    private static final double WEIGHT_USER_PREFERENCES = 0.6;
    private static final double WEIGHT_USER_HISTORY = 0.2; 
    private static final double WEIGHT_USER_LOCATION = 0.1;
    private static final double WEIGHT_USER_FREE_EVENT = 0.05;
    private static final double WEIGHT_USER_AVAILABILITY = 0.05;

    // Získať všetky udalosti
    public List<Event> getAllEvents() {
        List<Event> events = eventRepository.findAll();
        // Update and save status for all events before returning
        events.forEach(this::updateAndSaveEventStatus);
        return events;
    }

    // Získať jednu udalosť podľa ID
    public Optional<Event> getEventById(Long id) {
        Optional<Event> eventOpt = eventRepository.findById(id);
        eventOpt.ifPresent(this::updateAndSaveEventStatus);
        return eventOpt;
    }

    // Vytvoriť novú udalosť
    public Event createEvent(Event event) {
        return eventRepository.save(event);
    }

    public Event createEventWithImage(
            MultipartFile image,
            String name,
            String description,
            String category,
            int capacity,
            double price,
            LocalDate date,
            LocalTime time,
            Integer duration,
            List<Long> roomIds
    ) throws IOException {
        Event event = new Event();
        // Ak je obrázok prítomný
        if (image != null && !image.isEmpty()) {
            // Odstránenie medzier z názvu obrázku
            String originalFileName = image.getOriginalFilename();
            String cleanedFileName = originalFileName != null ? originalFileName.replaceAll("\\s+", "_") : "default_image";
            // Generovanie náhodného UUID pre názov obrázka
            String uniqueId = UUID.randomUUID().toString();
            String newFileName = uniqueId + "_" + cleanedFileName;

            // Vytvorenie cesty pre ukladanie obrázka
            Path filePath = Paths.get(UPLOAD_DIR + newFileName);
            Files.createDirectories(filePath.getParent()); // Vytvor priečinok, ak neexistuje
            Files.write(filePath, image.getBytes()); // Ulož obrázok

            // Nastavenie cesty k obrázku do udalosti
            event.setImagePath(filePath.toString());
        } else {
            // Ak obrázok nie je prítomný, nechaj imagePath ako null
            event.setImagePath(null);
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        EventOrganizer eventOrganizer = eventOrganizerService.getEventOrganizerByUsername(username);

        if (duration < 15) {
            throw new IllegalArgumentException("Dĺžka trvania udalosti musí byť aspoň 15 minút.");
        }

        // Získať miestnosti podľa ID
        List<Room> rooms = roomRepository.findAllById(roomIds);

        event.setName(name);
        event.setDescription(description);
        event.setCategory(category);
        event.setMaxCapacity(capacity);
        event.setPrice(price);
        event.setEventDate(date);
        event.setStartTime(time.truncatedTo(ChronoUnit.MINUTES));
        event.setDuration(duration);
        event.setRooms(rooms); // Priradenie lokality
        event.setEventOrganizer(eventOrganizer);

        // Ulož udalosť do databázy
        Event eventt = eventRepository.save(event);
        return eventt;
    }

    public Event updateEventWithImage(
            Long eventId,
            MultipartFile image,
            String name,
            String description,
            String category,
            Integer capacity,
            Double price,
            LocalDate eventDate,
            LocalTime time,
            Integer duration,
            List<Long> roomIds
    ) throws IOException {
        // 1. Nájdi existujúci event
        Event existingEvent = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event s ID " + eventId + " neexistuje"));

        // 2. Autorizačná kontrola
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        EventOrganizer currentOrganizer = eventOrganizerService.getEventOrganizerByUsername(username);
        if (!existingEvent.getEventOrganizer().getId().equals(currentOrganizer.getId())) {
            throw new AccessDeniedException("Nemáte oprávnenie upravovať tento event");
        }

        // 3. Aktualizácia základných polí
        if (name != null) existingEvent.setName(name);
        if (description != null) existingEvent.setDescription(description);
        if (category != null) existingEvent.setCategory(category);
        if (capacity != null) existingEvent.setMaxCapacity(capacity);
        if (price != null) existingEvent.setPrice(price);
        if (eventDate != null) existingEvent.setEventDate(eventDate);
        if (time != null) {
            existingEvent.setStartTime(time.truncatedTo(ChronoUnit.MINUTES));
        }
        if (duration != null && duration < 15) {
            throw new IllegalArgumentException("Dĺžka trvania udalosti musí byť aspoň 15 minút.");
        }
        existingEvent.setDuration(duration);

        // 4. Spracovanie obrázka
        if (image != null && !image.isEmpty()) {
            // Odstráni starý obrázok
            if (existingEvent.getImagePath() != null) {
                try {
                    Files.deleteIfExists(Paths.get(existingEvent.getImagePath()));
                } catch (IOException e) {
                    System.err.println("Chyba pri mazaní starého obrázka: " + existingEvent.getImagePath());
                }
            }

            // Ulož nový obrázok
            String originalFileName = image.getOriginalFilename();
            String cleanedFileName = originalFileName != null ?
                    originalFileName.replaceAll("\\s+", "_") : "default_image";
            String uniqueId = UUID.randomUUID().toString();
            String newFileName = uniqueId + "_" + cleanedFileName;
            Path filePath = Paths.get(UPLOAD_DIR + newFileName);
            Files.createDirectories(filePath.getParent());
            Files.write(filePath, image.getBytes());
            existingEvent.setImagePath(filePath.toString());
        }

        // 5. Aktualizácia miestností a lokality
        if (roomIds != null) {
            if (roomIds.isEmpty()) {
                throw new IllegalArgumentException("Musíte zadať aspoň jednu miestnosť");
            }

            // Kontrola existencie všetkých miestností
            List<Room> rooms = roomRepository.findAllById(roomIds);
            Set<Long> foundIds = rooms.stream()
                    .map(Room::getId)
                    .collect(Collectors.toSet());
            List<Long> missingIds = roomIds.stream()
                    .filter(id -> !foundIds.contains(id))
                    .toList();

            if (!missingIds.isEmpty()) {
                throw new EntityNotFoundException("Nenašli sa miestnosti s ID: " + missingIds);
            }
            existingEvent.setRooms(rooms);
        }

        // 6. Ulož zmeny
        return eventRepository.save(existingEvent);
    }

    public void deleteEvent(Long id) throws IOException, AccessDeniedException {
        // Získaj udalosť podľa ID
        Optional<Event> eventOptional = eventRepository.findById(id);
        if (eventOptional.isPresent()) {
            Event event = eventOptional.get();
            
            // Check if the current user is the owner of this event
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            EventOrganizer currentOrganizer = eventOrganizerService.getEventOrganizerByUsername(username);
            
            // If the event doesn't belong to the current user, throw AccessDeniedException
            if (!event.getEventOrganizer().getId().equals(currentOrganizer.getId())) {
                throw new AccessDeniedException("You don't have permission to delete this event");
            }
            
            String imagePathS = event.getImagePath();
            if (imagePathS != null) {
                Path imagePath = Paths.get(imagePathS);
                if (Files.exists(imagePath)) {
                    Files.delete(imagePath);  // Odstráni obrázok zo systému
                }
            }
            // Potom odstránime udalosť z databázy
            eventRepository.delete(event);
        } else {
            throw new ResourceNotFoundException("Event not found");
        }
    }

    public List<LocalTime[]> getOccupiedTimes(List<Long> roomIds, LocalDate date, Long excludeEventId) {
        List<Event> events = eventRepository.findByRooms_IdInAndEventDate(roomIds, date);
        // Filter and map to time slots
        return events.stream()
                .filter(event -> excludeEventId == null || !event.getId().equals(excludeEventId))
                .map(event -> new LocalTime[] {
                        event.getStartTime(),
                        event.getStartTime().plusMinutes(event.getDuration())
                })
                .collect(Collectors.toList());
    }

    // Keep the original method for backward compatibility
    public List<LocalTime[]> getOccupiedTimes(List<Long> roomIds, LocalDate date) {
        return getOccupiedTimes(roomIds, date, null);
    }

    // Získať všetky udalosti pre konkrétneho organizátora
    public List<Event> getEventsByOrganizer(EventOrganizer eventOrganizer) {
        return eventRepository.findByEventOrganizerId(eventOrganizer.getId());
    }

    // Získať udalosti pre aktuálne prihláseného používateľa
    public List<Event> getMyEvents() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        EventOrganizer currentOrganizer = eventOrganizerService.getEventOrganizerByUsername(username);
        List<Event> events = getEventsByOrganizer(currentOrganizer);
        
        // Update and save status for all events before returning
        events.forEach(this::updateAndSaveEventStatus);
        
        return events;
    }

    // Helper method to update and save event status
    private void updateAndSaveEventStatus(Event event) {
        EventStatus oldStatus = event.getStatus();
        event.updateStatus();
        // Only save if status has changed
        if (oldStatus != event.getStatus()) {
            eventRepository.save(event);
        }
    }
    
    /**
     * Get suggested events based on user and location
     * @param longitude The longitude coordinate (can be null)
     * @param latitude The latitude coordinate (can be null)
     * @return A list of suggested events
     */
    public List<Event> getSuggestedEvents(Double longitude, Double latitude) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        // Check if the user is authenticated and not anonymous
        if (authentication != null && 
            authentication.isAuthenticated() && 
            !authentication.getPrincipal().equals("anonymousUser")) {
            
            String username = authentication.getName();
            Optional<RegisteredUser> registeredUserOptional = registeredUserRepository.findByUsername(username);
            
            if (registeredUserOptional.isPresent()) {
                RegisteredUser registeredUser = registeredUserOptional.get();
                System.out.println("Suggesting events for user: " + registeredUser.getUsername());
                return getSuggestedEventsRegisteredUser(registeredUser, longitude, latitude);
            }
        }
        System.out.println("Suggesting events for anonymous user");
        // Default to anonymous suggestions if no valid authenticated user found
        return getSuggestedEventsAnonym(longitude, latitude);
    }
    
    /**
     * Get events near a specific location for anonymous users
     * @param longitude The longitude coordinate
     * @param latitude The latitude coordinate
     * @return A list of suggested events
     */
    private List<Event> getSuggestedEventsAnonym(Double longitude, Double latitude) {
        // Start with upcoming events
        List<Event> upcomingEvents = getAvailableUpcomingEvents();
        
        // If no location provided, just return random upcoming events limited to 12
        if (longitude == null || latitude == null) {
            return upcomingEvents.stream()
                    .limit(12)
                    .collect(Collectors.toList());
        }
        
        Map<Event, Double> eventScores = new HashMap<>();
        
        // Find the nearest city to the given coordinates
        City nearestCity = findNearestCity(longitude, latitude);
        
//        // Print information about the request location
//        System.out.println("=== REQUEST LOCATION ===");
//        System.out.printf("Coordinates: Lat=%.6f, Lon=%.6f\n", latitude, longitude);
//        if (nearestCity != null) {
//            System.out.printf("Nearest city: %s, %s (Distance: %.2f km)\n",
//                nearestCity.getName(),
//                nearestCity.getCountry(),
//                calculateDistance(latitude, longitude, nearestCity.getLatitude(), nearestCity.getLongitude()));
//        } else {
//            System.out.println("No city found near the provided coordinates");
//        }
//        System.out.println("======================");
        
        // Score each event
        for (Event event : upcomingEvents) {
            double score = 0.0;
            
            // 1. Check if event is in the same city (50%)
            if (nearestCity != null) {
                if (isEventInCity(event, nearestCity)) {
                    score += WEIGHT_SAME_CITY;
                }
            } else {
                // Alternative logic if no nearest city is found
                score += 0.3; // Base score for events without city context
            }
            
            // 2. Check if event is within 15km (35%)
            double distanceScore = calculateDistanceScore(event, longitude, latitude);
            score += (distanceScore * WEIGHT_DISTANCE);
            
            // 3. Check if event is free (10%)
            if (event.getPrice() != null && event.getPrice() == 0.0) {
                score += WEIGHT_FREE_EVENT;
            }
            
            // 4. Check if event is "HOT" (5%)
            double availabilityScore = calculateAvailabilityScore(event);
            score += (availabilityScore * WEIGHT_AVAILABILITY);
            
            eventScores.put(event, score);
        }
        
//        // Print event scores for debugging
//        System.out.println("=== EVENT SCORES ===");
//        eventScores.forEach((event, score) -> {
//            // Get city name if available
//            String cityName = "No city";
//            double eventLat = 0.0;
//            double eventLon = 0.0;
//
//            if (event.getRooms() != null && !event.getRooms().isEmpty() &&
//                event.getRooms().get(0).getLocality() != null &&
//                event.getRooms().get(0).getLocality().getCity() != null) {
//                cityName = event.getRooms().get(0).getLocality().getCity().getName();
//
//                if (event.getRooms().get(0).getLocality().getCity().getLatitude() != null &&
//                    event.getRooms().get(0).getLocality().getCity().getLongitude() != null) {
//                    eventLat = event.getRooms().get(0).getLocality().getCity().getLatitude();
//                    eventLon = event.getRooms().get(0).getLocality().getCity().getLongitude();
//                }
//            }
//
//            // Enhanced logging with detailed information
//            System.out.printf("Event ID: %d | Mesto: %s | Vzdialenosť: %.2f km | Cena: %.2f EUR | Kapacita: %d/%d | Skóre: %.2f\n",
//                event.getId(),
//                cityName,
//                (eventLat != 0.0 && eventLon != 0.0) ? calculateDistance(latitude, longitude, eventLat, eventLon) : -1.0,
//                event.getPrice() != null ? event.getPrice() : 0.0,
//                event.getReservations() != null ? event.getReservations().size() : 0,
//                event.getMaxCapacity(),
//                score
//            );
//        });
//        System.out.println("===================");
        
        // Sort events by score (descending) and take top 12
        return eventScores.entrySet().stream()
                .sorted(Map.Entry.<Event, Double>comparingByValue().reversed())
                .limit(12)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }
    
    /**
     * Check if an event is in a specific city
     */
    private boolean isEventInCity(Event event, City city) {
        if (city == null || event.getRooms() == null || event.getRooms().isEmpty()) {
            return false;
        }
        
        // Get the city of the event's first room's locality
        Room firstRoom = event.getRooms().get(0);
        if (firstRoom.getLocality() != null && 
            firstRoom.getLocality().getCity() != null) {
            return firstRoom.getLocality().getCity().getId().equals(city.getId());
        }
        return false;
    }
    
    /**
     * Calculate score based on distance from coordinates to event location
     * Full score (1.0) if within 5km, scaled down to 0 at 15km
     */
    private double calculateDistanceScore(Event event, Double longitude, Double latitude) {
        if (event.getRooms() == null || event.getRooms().isEmpty()) {
            return 0.0;
        }
        
        Room firstRoom = event.getRooms().get(0);
        if (firstRoom.getLocality() == null || 
            firstRoom.getLocality().getCity() == null || 
            firstRoom.getLocality().getCity().getLatitude() == null || 
            firstRoom.getLocality().getCity().getLongitude() == null) {
            return 0.0;
        }
        
        double eventLat = firstRoom.getLocality().getCity().getLatitude();
        double eventLon = firstRoom.getLocality().getCity().getLongitude();
        
        double distance = calculateDistance(latitude, longitude, eventLat, eventLon);
        
        // Full score if within 5km, scaled down to 0 at 15km
        if (distance <= 5) {
            return 1.0;
        } else if (distance <= 15) {
            return 1.0 - ((distance - 5) / 10);
        } else {
            return 0.0;
        }
    }
    
    /**
     * Calculate Haversine distance between two points
     * @return Distance in kilometers
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth's radius in kilometers
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c;
    }
    
    /**
     * Calculate score for event availability
     * Full score (1.0) if almost full (less than 10% spots remaining)
     */
    private double calculateAvailabilityScore(Event event) {
        if (event.getReservations() == null || event.getMaxCapacity() <= 0) {
            return 0.0;
        }
        
        int reservationCount = event.getReservations().size();
        int availableSpots = event.getMaxCapacity() - reservationCount;
        double availablePercentage = (double) availableSpots / event.getMaxCapacity();
        
        // If less than 10% spots remaining, it's "HOT"
        if (availablePercentage <= 0.1) {
            return 1.0;
        } else if (availablePercentage <= 0.3) {
            // Scale between 10% and 30% availability
            return 1.0 - ((availablePercentage - 0.1) / 0.2);
        } else {
            return 0.0;
        }
    }
    
    /**
     * Find the nearest city to the given coordinates
     */
    private City findNearestCity(Double longitude, Double latitude) {
        List<City> allCities = cityRepository.findAll();
        
        if (allCities.isEmpty()) {
            return null;
        }
        
        City nearestCity = null;
        double shortestDistance = Double.MAX_VALUE;
        
        for (City city : allCities) {
            if (city.getLatitude() != null && city.getLongitude() != null) {
                double distance = calculateDistance(
                    latitude, longitude, city.getLatitude(), city.getLongitude()
                );
                
                if (distance < shortestDistance) {
                    shortestDistance = distance;
                    nearestCity = city;
                }
            }
        }
        
        return nearestCity;
    }
    
    private List<Event> getSuggestedEventsRegisteredUser(RegisteredUser registeredUser, Double longitude, Double latitude) {
        // Get upcoming available events
        List<Event> upcomingEvents = getAvailableUpcomingEvents();
        
        // If no events are available, return empty list
        if (upcomingEvents.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Extract IDs of events the user has already reserved
        Set<Long> reservedEventIds;
        if (registeredUser.getReservations() != null) {
            reservedEventIds = registeredUser.getReservations().stream()
                    .map(reservation -> reservation.getEvent().getId())
                    .collect(Collectors.toSet());
        } else {
            reservedEventIds = new HashSet<>();
        }

        // Filter out events that the user has already reserved
        List<Event> nonReservedEvents = upcomingEvents.stream()
                .filter(event -> !reservedEventIds.contains(event.getId()))
                .toList();
        
        // If no non-reserved events are available, return empty list
        if (nonReservedEvents.isEmpty()) {
            return new ArrayList<>();
        }
        
        Map<Event, Double> eventScores = new HashMap<>();
        
        // Print user preferences for debugging
        System.out.println("=== USER PREFERENCES ===");
        System.out.printf("User: %s\n", registeredUser.getUsername());
        System.out.printf("Preferred Category: %s\n", 
            registeredUser.getPreferredCategory() != null ? registeredUser.getPreferredCategory() : "Not set");
        System.out.printf("Price Range: %s - %s EUR\n", 
            registeredUser.getMinPrice() != null ? registeredUser.getMinPrice() : "Not set",
            registeredUser.getMaxPrice() != null ? registeredUser.getMaxPrice() : "Not set");
        System.out.printf("Preferred City: %s\n", 
            registeredUser.getPrefferedCity() != null ? registeredUser.getPrefferedCity().getName() : "Not set");
        System.out.printf("Reservations: %d\n", 
            registeredUser.getReservations() != null ? registeredUser.getReservations().size() : 0);
        System.out.println("=======================");
        
        // Score each event
        for (Event event : nonReservedEvents) {
            double score = 0.0;
            
            // ========== USER PREFERENCES (60%) ==========
            double preferenceScore = calculatePreferenceScore(event, registeredUser);
            double weightedPreferenceScore = preferenceScore * WEIGHT_USER_PREFERENCES;
            score += weightedPreferenceScore;
            
            // ========== USER HISTORY (20%) ==========
            double historyScore = calculateHistoryScore(event, registeredUser);
            double weightedHistoryScore = historyScore * WEIGHT_USER_HISTORY;
            score += weightedHistoryScore;
            
            // ========== LOCATION AND OTHER FACTORS (20%) ==========
            // Find nearest city to provided coordinates if available
            City locationCity = null;
            if (longitude != null && latitude != null) {
                locationCity = findNearestCity(longitude, latitude);
            }
            
            // Location proximity (10%)
            double locationScore = 0.0;
            if (locationCity != null) {
                if (isEventInCity(event, locationCity)) {
                    locationScore += 0.5;  // Half of location score for same city
                }
                double distanceScore = calculateDistanceScore(event, longitude, latitude);
                locationScore += (distanceScore * 0.5);  // Half of location score for proximity
            }
            // Apply location weight
            double weightedLocationScore = locationScore * WEIGHT_USER_LOCATION;
            score += weightedLocationScore;
            
            // Free event bonus (5%)
            double freeScore = 0.0;
            if (event.getPrice() != null && event.getPrice() == 0.0) {
                freeScore = 1.0;  // Full score (1.0) if free
            }
            score += (freeScore * WEIGHT_USER_FREE_EVENT);
            
            // Availability/"hotness" score (5%)
            double availabilityScore = calculateAvailabilityScore(event);
            double weightedAvailabilityScore = availabilityScore * WEIGHT_USER_AVAILABILITY;
            score += weightedAvailabilityScore;
            
            eventScores.put(event, score);
        }
        
        // Print event scores for debugging
        System.out.println("=== EVENT SCORES (REGISTERED USER) ===");
        System.out.println("SCORING EXPLANATION:");
        System.out.println("- Total score ranges from 0.0 to 1.0");
        System.out.println("- User Preferences (60%): Based on category, price, city matching user's settings");
        System.out.println("- User History (20%): Based on similarities to previously attended events");
        System.out.println("- Location (10%): Based on proximity to current location");
        System.out.println("- Free Event Bonus (5%): Full points if event is free");
        System.out.println("- Availability (5%): More points if event is nearly full (\"hot\")");
        System.out.println("----------------------------------------");
        
        eventScores.forEach((event, score) -> {
            // Get city name if available
            String cityName = "No city";
            double eventLat = 0.0;
            double eventLon = 0.0;

            if (event.getRooms() != null && !event.getRooms().isEmpty() &&
                event.getRooms().get(0).getLocality() != null &&
                event.getRooms().get(0).getLocality().getCity() != null) {
                cityName = event.getRooms().get(0).getLocality().getCity().getName();

                if (event.getRooms().get(0).getLocality().getCity().getLatitude() != null &&
                    event.getRooms().get(0).getLocality().getCity().getLongitude() != null) {
                    eventLat = event.getRooms().get(0).getLocality().getCity().getLatitude();
                    eventLon = event.getRooms().get(0).getLocality().getCity().getLongitude();
                }
            }

            // Calculate individual scores for detailed output
            double preferenceScore = calculatePreferenceScore(event, registeredUser);
            double weightedPreferenceScore = preferenceScore * WEIGHT_USER_PREFERENCES;
            
            double historyScore = calculateHistoryScore(event, registeredUser);
            double weightedHistoryScore = historyScore * WEIGHT_USER_HISTORY;
            
            double locationScore = 0.0;
            if (longitude != null && latitude != null) {
                City locationCity = findNearestCity(longitude, latitude);
                if (locationCity != null) {
                    if (isEventInCity(event, locationCity)) {
                        locationScore += 0.5;
                    }
                    locationScore += (calculateDistanceScore(event, longitude, latitude) * 0.5);
                }
            }
            double weightedLocationScore = locationScore * WEIGHT_USER_LOCATION;
            
            double freeScore = (event.getPrice() != null && event.getPrice() == 0.0) ? 1.0 : 0.0;
            double weightedFreeScore = freeScore * WEIGHT_USER_FREE_EVENT;
            
            double availabilityScore = calculateAvailabilityScore(event);
            double weightedAvailabilityScore = availabilityScore * WEIGHT_USER_AVAILABILITY;

            // Enhanced logging with detailed information
            System.out.printf("Event ID: %d | Name: %s | Category: %s | City: %s | Price: %.2f EUR\n",
                event.getId(),
                event.getName(),
                event.getCategory() != null ? event.getCategory() : "None",
                cityName,
                event.getPrice() != null ? event.getPrice() : 0.0
            );
            System.out.printf("  Detailed Scores: [Pref: %.2f (raw: %.2f), Hist: %.2f (raw: %.2f), Loc: %.2f, Free: %.2f, Avail: %.2f]\n",
                weightedPreferenceScore,
                preferenceScore,
                weightedHistoryScore,
                historyScore,
                weightedLocationScore,
                weightedFreeScore,
                weightedAvailabilityScore
            );
            System.out.printf("  TOTAL SCORE: %.2f (max possible: 1.0)\n\n", score);
        });
        System.out.println("======================================");
        
        // Sort events by score (descending) and take top 12
        return eventScores.entrySet().stream()
                .sorted(Map.Entry.<Event, Double>comparingByValue().reversed())
                .limit(12)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    /**
     * Calculate score based on user preferences (category, price range, city)
     * @return Score between 0.0 and 1.0
     */
    private double calculatePreferenceScore(Event event, RegisteredUser user) {
        double score = 0.0;
        double totalFactors = 0.0;
        
        // 1. Category preference (1/3 of preference score)
        if (user.getPreferredCategory() != null && !user.getPreferredCategory().isEmpty()) {
            totalFactors += 1.0;
            if (event.getCategory() != null && 
                event.getCategory().equalsIgnoreCase(user.getPreferredCategory())) {
                score += 1.0;
            }
        }
        
        // 2. Price range preference (1/3 of preference score)
        if (user.getMinPrice() != null && user.getMaxPrice() != null) {
            totalFactors += 1.0;
            if (event.getPrice() != null) {
                if (event.getPrice() >= user.getMinPrice() && 
                    event.getPrice() <= user.getMaxPrice()) {
                    score += 1.0;
                } else {
                    // Partial score for prices close to the range
                    double minDiff = Math.abs(event.getPrice() - user.getMinPrice());
                    double maxDiff = Math.abs(event.getPrice() - user.getMaxPrice());
                    double closestDiff = Math.min(minDiff, maxDiff);
                    
                    // If within 20% of the range or within 10 EUR
                    double range = user.getMaxPrice() - user.getMinPrice();
                    double tolerance = Math.max(range * 0.2, 10.0);
                    
                    if (closestDiff <= tolerance) {
                        score += 1.0 * (1.0 - (closestDiff / tolerance));
                    }
                }
            }
        }
        
        // 3. Preferred city (1/3 of preference score)
        if (user.getPrefferedCity() != null) {
            totalFactors += 1.0;
            if (isEventInCity(event, user.getPrefferedCity())) {
                score += 1.0;
            }
        }
        
        // Normalize score if we had at least one preference
        return totalFactors > 0 ? score / totalFactors : 0.0;
    }

    /**
     * Calculate score based on user history of attended events
     * @return Score between 0.0 and 1.0
     */
    private double calculateHistoryScore(Event event, RegisteredUser user) {
        if (user.getReservations() == null || user.getReservations().isEmpty()) {
            return 0.0;
        }
        
        // Extract past events from user's reservations
        List<Event> pastEvents = user.getReservations().stream()
                .map(Reservation::getEvent)
                .filter(Objects::nonNull)
                .toList();
        
        if (pastEvents.isEmpty()) {
            return 0.0;
        }
        
        // Count matches for each factor
        int categoryMatches = 0;
        int cityMatches = 0;
        int priceRangeMatches = 0;
        
        // Price similarity tolerance (consider events within 20% of price or 10 EUR)
        double eventPrice = event.getPrice() != null ? event.getPrice() : 0.0;
        double priceTolerance = Math.max(eventPrice * 0.25, 10.0);
        
        for (Event pastEvent : pastEvents) {
            // Category match
            if (event.getCategory() != null && pastEvent.getCategory() != null && 
                event.getCategory().equals(pastEvent.getCategory())) {
                categoryMatches++;
            }
            
            // City match
            if (event.getRooms() != null && !event.getRooms().isEmpty() &&
                pastEvent.getRooms() != null && !pastEvent.getRooms().isEmpty()) {
                
                City eventCity = null;
                City pastEventCity = null;
                
                if (event.getRooms().get(0).getLocality() != null &&
                    event.getRooms().get(0).getLocality().getCity() != null) {
                    eventCity = event.getRooms().get(0).getLocality().getCity();
                }
                
                if (pastEvent.getRooms().get(0).getLocality() != null &&
                    pastEvent.getRooms().get(0).getLocality().getCity() != null) {
                    pastEventCity = pastEvent.getRooms().get(0).getLocality().getCity();
                }
                
                if (eventCity != null && pastEventCity != null &&
                    eventCity.getId().equals(pastEventCity.getId())) {
                    cityMatches++;
                }
            }
            
            // Price similarity
            if (event.getPrice() != null && pastEvent.getPrice() != null) {
                if (Math.abs(event.getPrice() - pastEvent.getPrice()) <= priceTolerance) {
                    priceRangeMatches++;
                }
            }
        }
        
        // Calculate scores as percentages of matches (equal weighting)
        double categoryScore = (double) categoryMatches / pastEvents.size();
        double cityScore = (double) cityMatches / pastEvents.size();
        double priceScore = (double) priceRangeMatches / pastEvents.size();
        
        // Combine scores with equal weighting for overall history score
        return (categoryScore + cityScore + priceScore) / 3.0;
    }
    
    /**
     * Get upcoming events (events in the future)
     */
    public List<Event> getUpcomingEvents() {
        // Get all events
        List<Event> allEvents = eventRepository.findAll();
        
        // Update and save status for all events
        allEvents.forEach(this::updateAndSaveEventStatus);
        
        // Filter to exclude INACTIVE events (past events)
        return allEvents.stream()
                .filter(event -> event.getStatus() != EventStatus.INACTIVE)
                .collect(Collectors.toList());
    }

    /**
     * Get available upcoming events (excluding FULL and UNACTIVE events)
     * @return List of active events with available capacity
     */
    private List<Event> getAvailableUpcomingEvents() {
        // Get all upcoming events
        List<Event> upcomingEvents = getUpcomingEvents();
        
        // Filter out FULL events
        return upcomingEvents.stream()
                .filter(event -> event.getStatus() != EventStatus.FULL)
                .collect(Collectors.toList());
    }
}
