package com.stuba.fei.reservation_system.controller.users;

import com.stuba.fei.reservation_system.model.users.Person;
import com.stuba.fei.reservation_system.model.users.RegisteredUser;
import com.stuba.fei.reservation_system.service.users.PersonService;
import com.stuba.fei.reservation_system.service.users.RegisteredUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/registered-users")
public class RegisteredUserController {
    private final RegisteredUserService registeredUserService;
    private final PersonService personService;

    public RegisteredUserController(RegisteredUserService registeredUserService, PersonService personService) {
        this.registeredUserService = registeredUserService;
        this.personService = personService;
    }

    @PostMapping
    public ResponseEntity<RegisteredUser> createRegisteredUser(@RequestBody RegisteredUser registeredUser) {
        return ResponseEntity.ok(registeredUserService.saveRegisteredUser(registeredUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegisteredUser> getRegisteredUser(@PathVariable Long id) {
        return registeredUserService.getRegisteredUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    //TODO tu je person zatial namiesto RegisteredUser
    @PutMapping("/{id}")
    public ResponseEntity<Person> updateRegisteredUser(
            @PathVariable Long id,
            @RequestBody RegisteredUser updatedRegisteredUser
    ) {
        try {
            Person updated = personService.updatePerson(id, updatedRegisteredUser);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRegisteredUser(@PathVariable Long id) {
        try {
            registeredUserService.deleteRegisteredUser(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
