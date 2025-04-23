package com.stuba.fei.reservation_system.controller;

import com.stuba.fei.reservation_system.model.Room;
import com.stuba.fei.reservation_system.service.RoomService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.util.List;

@RestController
@RequestMapping("/api/localities/{localityId}/rooms")
public class RoomController {
    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PreAuthorize("hasRole('SPACE_RENTER')")
    @PostMapping
    public ResponseEntity<Room> createRoom(@PathVariable Long localityId, @RequestBody Room room) {
        Room createdRoom = roomService.createRoom(localityId, room);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRoom);
    }

    @GetMapping
    public ResponseEntity<List<Room>> getRoomsByLocality(@PathVariable Long localityId) {
        List<Room> rooms = roomService.getRoomsByLocality(localityId);
        return ResponseEntity.ok(rooms);
    }

    @PreAuthorize("hasRole('SPACE_RENTER')")
    @PutMapping("/{roomId}")
    public ResponseEntity<?> updateRoom(
            @PathVariable Long roomId,
            @PathVariable Long localityId,
            @RequestBody Room roomDetails
    ) {
        try {
            Room updatedRoom = roomService.updateRoom(roomId, localityId, roomDetails);
            return ResponseEntity.ok(updatedRoom);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PreAuthorize("hasRole('SPACE_RENTER')")
    @DeleteMapping("/{roomId}")
    public ResponseEntity<?> deleteRoom(@PathVariable Long roomId, @PathVariable Long localityId) {
        try {
            roomService.deleteRoom(roomId, localityId);
            return ResponseEntity.noContent().build();
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}