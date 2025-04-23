package com.stuba.fei.reservation_system.repository.users;

import com.stuba.fei.reservation_system.model.users.Person;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PersonRepository extends JpaRepository<Person, Long> {

    Optional<Person> findByUsername(String username);

    // Check if a person exists with the given username
    boolean existsByUsername(String username);

    // Check if a person exists with the given email
    boolean existsByEmail(String email);
}

