package com.stuba.fei.reservation_system.security.controller;

import com.stuba.fei.reservation_system.model.users.EventOrganizer;
import com.stuba.fei.reservation_system.model.users.Person;
import com.stuba.fei.reservation_system.model.users.RegisteredUser;
import com.stuba.fei.reservation_system.model.users.SpaceRenter;
import com.stuba.fei.reservation_system.repository.users.EventOrganizerRepository;
import com.stuba.fei.reservation_system.repository.users.RegisteredUserRepository;
import com.stuba.fei.reservation_system.repository.users.SpaceRenterRepository;
import com.stuba.fei.reservation_system.security.service.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import com.stuba.fei.reservation_system.repository.users.PersonRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PersonRepository personRepository;
    private final PasswordEncoder passwordEncoder;
    private final EventOrganizerRepository eventOrganizerRepository;
    private final SpaceRenterRepository spaceRenterRepository;
    private final RegisteredUserRepository registeredUserRepository;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtService jwtService,
                          PersonRepository personRepository,
                          PasswordEncoder passwordEncoder,
                          EventOrganizerRepository eventOrganizerRepository,
                          SpaceRenterRepository spaceRenterRepository,
                          RegisteredUserRepository registeredUserRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.personRepository = personRepository;
        this.passwordEncoder = passwordEncoder;
        this.eventOrganizerRepository = eventOrganizerRepository;
        this.spaceRenterRepository = spaceRenterRepository;
        this.registeredUserRepository = registeredUserRepository;
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );

        // Získaj username priamo z authentication objektu!
        String username = authentication.getName();
        System.out.println(username);

        Person person = personRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String token = jwtService.generateJwtToken(username); // Opravené: posielame username

        return ResponseEntity.ok(new JwtResponse(token, person.getRole()));
    }

    // Registrácia používateľa
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        // Skontroluj, či používateľ s daným menom alebo emailom už neexistuje
        if (personRepository.existsByUsername(registerRequest.getUsername())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username is already taken!");
        }

        // Nová kontrola existencie emailu
        if (personRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email is already registered!");
        }


        if (registerRequest.getRole() == UserRole.REGISTERED_USER) {
            RegisteredUser registeredUser = new RegisteredUser();
            registeredUser.setUsername(registerRequest.getUsername());
            registeredUser.setPassword(passwordEncoder.encode(registerRequest.getPassword())); // Heslo je zašifrované
            registeredUser.setFirstName(registerRequest.getFirstName());
            registeredUser.setLastName(registerRequest.getlastName());
            registeredUser.setEmail(registerRequest.getEmail());
            registeredUser.setRole(UserRole.REGISTERED_USER);
            
            registeredUserRepository.save(registeredUser);

        } else if (registerRequest.getRole() == UserRole.SPACE_RENTER) {
            SpaceRenter spaceRenter = new SpaceRenter();
            spaceRenter.setUsername(registerRequest.getUsername());
            spaceRenter.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
            spaceRenter.setFirstName(registerRequest.getFirstName());
            spaceRenter.setLastName(registerRequest.getlastName());
            spaceRenter.setEmail(registerRequest.getEmail());
            spaceRenter.setMobilePhoneNumber(registerRequest.getPhoneNumber());
            spaceRenter.setRole(UserRole.SPACE_RENTER);

            spaceRenterRepository.save(spaceRenter);

        } else if (registerRequest.getRole() == UserRole.EVENT_ORGANIZER) {
            EventOrganizer eventOrganizer = new EventOrganizer();
            eventOrganizer.setUsername(registerRequest.getUsername());
            eventOrganizer.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
            eventOrganizer.setFirstName(registerRequest.getFirstName());
            eventOrganizer.setLastName(registerRequest.getlastName());
            eventOrganizer.setEmail(registerRequest.getEmail());
            eventOrganizer.setOrganizationName(registerRequest.getCompanyName());
            eventOrganizer.setMobilePhoneNumber(registerRequest.getPhoneNumber());
            eventOrganizer.setRole(UserRole.EVENT_ORGANIZER);

            // Ulož event organizera do databázy
            eventOrganizerRepository.save(eventOrganizer);


        } else {
            throw new IllegalArgumentException("Invalid user role");
        }

        // Generovanie JWT tokenu a jeho vrátenie
        String token = jwtService.generateJwtToken(registerRequest.getUsername());
        System.out.println("Zaregistrovany: " + registerRequest.getRole());
        return ResponseEntity.ok(new JwtResponse(token, registerRequest.getRole()));
    }

    /**
     * Endpoint to validate JWT token
     * This endpoint will return 200 OK if the token is valid and the user is authenticated.
     * Spring Security will automatically return 401 Unauthorized if the token is invalid or expired.
     */
    @GetMapping("/validate-token")
    public ResponseEntity<?> validateToken(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            Person person = personRepository.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));
            
            return ResponseEntity.ok(Map.of(
                "valid", true,
                "username", username,
                "role", person.getRole()
            ));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
    }
}
