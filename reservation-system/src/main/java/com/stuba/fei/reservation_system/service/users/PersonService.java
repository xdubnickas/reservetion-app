package com.stuba.fei.reservation_system.service.users;

import com.stuba.fei.reservation_system.model.users.Person;
import com.stuba.fei.reservation_system.repository.users.PersonRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PersonService {
    private final PersonRepository personRepository;

    public PersonService(PersonRepository personRepository) {
        this.personRepository = personRepository;
    }

    // CREATE
    public Person savePerson(Person person) {
        return personRepository.save(person);
    }

    // READ - All
    public List<Person> getAllPersons() {
        return personRepository.findAll();
    }

    // READ - By ID
    public Optional<Person> getPersonById(Long id) {
        return personRepository.findById(id);
    }
    
    // READ - By Username
    public Person getPersonByUsername(String username) {
        return personRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Person with username '" + username + "' not found"));
    }

    // UPDATE
    public Person updatePerson(Long id, Person personDetails) {
        Person person = getPersonById(id)
                .orElseThrow(() -> new RuntimeException("Person with ID " + id + " not found"));

        // Update basic person fields only if they are not null
        if (personDetails.getEmail() != null) {
            person.setEmail(personDetails.getEmail());
        }
        
        if (personDetails.getPassword() != null) {
            person.setPassword(personDetails.getPassword());
        }
        
        if (personDetails.getUsername() != null) {
            person.setUsername(personDetails.getUsername());
        }
        
        if (personDetails.getFirstName() != null) {
            person.setFirstName(personDetails.getFirstName());
        }
        
        if (personDetails.getLastName() != null) {
            person.setLastName(personDetails.getLastName());
        }
        
        // Role should generally not be updated via profile settings
        // but we'll include it for completeness
        if (personDetails.getRole() != null) {
            person.setRole(personDetails.getRole());
        }
        
        return personRepository.save(person);
    }

    // DELETE
    public void deletePerson(Long id) {
        if (!personRepository.existsById(id)) {
            throw new RuntimeException("Person with ID " + id + " not found");
        }
        personRepository.deleteById(id);
    }
}
