package com.stuba.fei.reservation_system.service.users;

import com.stuba.fei.reservation_system.model.users.RegisteredUser;
import com.stuba.fei.reservation_system.repository.users.PersonRepository;
import com.stuba.fei.reservation_system.repository.users.RegisteredUserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class RegisteredUserService {
    private final RegisteredUserRepository registeredUserRepository;
    private final PersonRepository personRepository;

    public RegisteredUserService(RegisteredUserRepository registeredUserRepository, PersonRepository personRepository) {
        this.registeredUserRepository = registeredUserRepository;
        this.personRepository = personRepository;
    }

    public RegisteredUser saveRegisteredUser(RegisteredUser registeredUser) {
        return registeredUserRepository.save(registeredUser);
    }

    public Optional<RegisteredUser> getRegisteredUserById(Long id) {
        return registeredUserRepository.findById(id);
    }

    // READ - Get RegisteredUser by username
    public RegisteredUser getRegisteredUserByUsername(String username) {
        return registeredUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("RegisteredUser with username '" + username + "' doesn't exist."));
    }

    public RegisteredUser updateRegisteredUser(Long id, RegisteredUser updatedRegisteredUser) {
        return registeredUserRepository.findById(id)
                .map(existingUser -> {
                    existingUser.setUsername(updatedRegisteredUser.getUsername());
                    existingUser.setEmail(updatedRegisteredUser.getEmail());
                    existingUser.setPassword(updatedRegisteredUser.getPassword());
                    existingUser.setFirstName(updatedRegisteredUser.getFirstName());
                    existingUser.setLastName(updatedRegisteredUser.getLastName());
                    return registeredUserRepository.save(existingUser);
                })
                .orElseThrow(() -> new RuntimeException("Registered User not found with id: " + id));
    }

    public void deleteRegisteredUser(Long id) {
        if (registeredUserRepository.existsById(id)) {
            registeredUserRepository.deleteById(id);
        } else {
            throw new RuntimeException("Registered User not found with id: " + id);
        }
    }
}