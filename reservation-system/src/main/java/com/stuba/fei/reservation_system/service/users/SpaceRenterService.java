package com.stuba.fei.reservation_system.service.users;

import com.stuba.fei.reservation_system.model.users.SpaceRenter;
import com.stuba.fei.reservation_system.repository.users.SpaceRenterRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SpaceRenterService {
    private final SpaceRenterRepository spaceRenterRepository;

    public SpaceRenterService(SpaceRenterRepository spaceRenterRepository) {
        this.spaceRenterRepository = spaceRenterRepository;
    }

    // CREATE - Uloženie SpaceRenter
    public SpaceRenter saveSpaceRenter(SpaceRenter spaceRenter) {
        return spaceRenterRepository.save(spaceRenter);
    }

    // READ - Získanie všetkých SpaceRenters
    public List<SpaceRenter> getAllSpaceRenters() {
        return spaceRenterRepository.findAll();
    }

    // READ - Získanie SpaceRenter podľa ID
    public SpaceRenter getSpaceRenterById(Long id) {
        return spaceRenterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SpaceRenter s ID " + id + " neexistuje."));
    }

    // READ - Získanie SpaceRenter podľa username
    public SpaceRenter getSpaceRenterByUsername(String username) {
        return spaceRenterRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("SpaceRenter s username '" + username + "' neexistuje."));
    }

    // UPDATE - Aktualizácia SpaceRenter podľa ID
    public SpaceRenter updateSpaceRenter(Long id, SpaceRenter spaceRenterDetails) {
        SpaceRenter spaceRenter = getSpaceRenterById(id);

        // Aktualizácia polí iba ak sú poskytnuté v požiadavke
        if (spaceRenterDetails.getUsername() != null) {
            spaceRenter.setUsername(spaceRenterDetails.getUsername());
        }
        
        if (spaceRenterDetails.getEmail() != null) {
            spaceRenter.setEmail(spaceRenterDetails.getEmail());
        }
        
        if (spaceRenterDetails.getPassword() != null) {
            spaceRenter.setPassword(spaceRenterDetails.getPassword());
        }
        
        if (spaceRenterDetails.getFirstName() != null) {
            spaceRenter.setFirstName(spaceRenterDetails.getFirstName());
        }
        
        if (spaceRenterDetails.getLastName() != null) {
            spaceRenter.setLastName(spaceRenterDetails.getLastName());
        }
        
        if (spaceRenterDetails.getMobilePhoneNumber() != null) {
            spaceRenter.setMobilePhoneNumber(spaceRenterDetails.getMobilePhoneNumber());
        }

        return spaceRenterRepository.save(spaceRenter);
    }

    // DELETE - Odstránenie SpaceRenter podľa ID
    public void deleteSpaceRenter(Long id) {
        if (!spaceRenterRepository.existsById(id)) {
            throw new RuntimeException("SpaceRenter s ID " + id + " neexistuje.");
        }
        spaceRenterRepository.deleteById(id);
    }
}
