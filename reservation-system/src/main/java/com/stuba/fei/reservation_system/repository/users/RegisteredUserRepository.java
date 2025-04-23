package com.stuba.fei.reservation_system.repository.users;

import com.stuba.fei.reservation_system.model.users.RegisteredUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RegisteredUserRepository extends JpaRepository<RegisteredUser, Long> {
    Optional<RegisteredUser> findByUsername(String username); // Vráti Optional
}
