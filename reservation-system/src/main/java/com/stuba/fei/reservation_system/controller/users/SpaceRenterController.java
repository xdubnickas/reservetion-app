package com.stuba.fei.reservation_system.controller.users;

import com.stuba.fei.reservation_system.model.users.SpaceRenter;
import com.stuba.fei.reservation_system.service.users.SpaceRenterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/space-renters")
public class SpaceRenterController {
    private final SpaceRenterService spaceRenterService;

    public SpaceRenterController(SpaceRenterService spaceRenterService) {
        this.spaceRenterService = spaceRenterService;
    }

    // CREATE - Vytvorenie SpaceRenter
    @PostMapping
    public ResponseEntity<SpaceRenter> createSpaceRenter(@RequestBody SpaceRenter spaceRenter) {
        return ResponseEntity.ok(spaceRenterService.saveSpaceRenter(spaceRenter));
    }

    // READ - Získanie všetkých SpaceRenters
    @GetMapping
    public ResponseEntity<List<SpaceRenter>> getAllSpaceRenters() {
        return ResponseEntity.ok(spaceRenterService.getAllSpaceRenters());
    }

    // READ - Získanie SpaceRenter podľa ID
    @GetMapping("/{id}")
    public ResponseEntity<SpaceRenter> getSpaceRenterById(@PathVariable Long id) {
        try {
            SpaceRenter spaceRenter = spaceRenterService.getSpaceRenterById(id);
            return ResponseEntity.ok(spaceRenter);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // READ - Získanie SpaceRenter podľa username
    @GetMapping("/username/{username}")
    public ResponseEntity<SpaceRenter> getSpaceRenterByUsername(@PathVariable String username) {
        try {
            SpaceRenter spaceRenter = spaceRenterService.getSpaceRenterByUsername(username);
            return ResponseEntity.ok(spaceRenter);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // UPDATE - Aktualizácia SpaceRenter podľa ID
    @PutMapping("/{id}")
    public ResponseEntity<SpaceRenter> updateSpaceRenter(
            @PathVariable Long id,
            @RequestBody SpaceRenter updatedSpaceRenter
    ) {
        try {
            SpaceRenter updated = spaceRenterService.updateSpaceRenter(id, updatedSpaceRenter);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // UPDATE - Aktualizácia SpaceRenter podľa username
    @PutMapping("/username/{username}")
    public ResponseEntity<SpaceRenter> updateSpaceRenterByUsername(
            @PathVariable String username,
            @RequestBody SpaceRenter updatedSpaceRenter
    ) {
        try {
            SpaceRenter spaceRenter = spaceRenterService.getSpaceRenterByUsername(username);
            SpaceRenter updated = spaceRenterService.updateSpaceRenter(spaceRenter.getId(), updatedSpaceRenter);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE - Odstránenie SpaceRenter podľa ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSpaceRenter(@PathVariable Long id) {
        try {
            spaceRenterService.deleteSpaceRenter(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
