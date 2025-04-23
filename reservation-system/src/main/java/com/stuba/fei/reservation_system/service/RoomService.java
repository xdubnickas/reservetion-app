package com.stuba.fei.reservation_system.service;

import com.stuba.fei.reservation_system.model.Locality;
import com.stuba.fei.reservation_system.model.Room;
import com.stuba.fei.reservation_system.model.users.SpaceRenter;
import com.stuba.fei.reservation_system.repository.RoomRepository;
import com.stuba.fei.reservation_system.service.users.SpaceRenterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.nio.file.AccessDeniedException;
import java.util.List;

@Service
public class RoomService {
    private final RoomRepository roomRepository;
    private final LocalityService localityService;
    
    @Autowired
    private SpaceRenterService spaceRenterService;

    public RoomService(RoomRepository roomRepository, LocalityService localityService) {
        this.roomRepository = roomRepository;
        this.localityService = localityService;
    }

    public Room createRoom(Long localityId, Room room) {
        Locality locality = localityService.getLocalityById(localityId)
                .orElseThrow(() -> new RuntimeException("Locality not found"));

        locality.setTotalCapacity(locality.getTotalCapacity() + room.getCapacity());
        room.setLocality(locality);
        return roomRepository.save(room);
    }

    public List<Room> getRoomsByLocality(Long localityId) {
        Locality locality = localityService.getLocalityById(localityId)
                .orElseThrow(() -> new RuntimeException("Locality not found"));
        return roomRepository.findAllByLocality(locality);
    }

    public Room updateRoom(Long id, Long localityId, Room roomDetails) throws AccessDeniedException {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        Locality locality = localityService.getLocalityById(localityId)
                .orElseThrow(() -> new RuntimeException("Locality not found"));
        
        // Check if current user is the owner of the locality
        verifyRoomOwnership(locality);

        locality.setTotalCapacity(locality.getTotalCapacity() - room.getCapacity() + roomDetails.getCapacity());
        room.setName(roomDetails.getName());
        room.setFloor(roomDetails.getFloor());
        room.setCapacity(roomDetails.getCapacity());
        return roomRepository.save(room);
    }

    public void deleteRoom(Long id, Long localityId) throws AccessDeniedException {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        Locality locality = localityService.getLocalityById(localityId)
                .orElseThrow(() -> new RuntimeException("Locality not found"));
        
        // Check if current user is the owner of the locality
        verifyRoomOwnership(locality);

        locality.setTotalCapacity(locality.getTotalCapacity() - room.getCapacity());
        roomRepository.deleteById(id);
    }
    
    /**
     * Verifies that the current authenticated user is the owner of the locality
     * @param locality The locality to check ownership of
     * @throws AccessDeniedException If the current user is not the owner
     */
    private void verifyRoomOwnership(Locality locality) throws AccessDeniedException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        SpaceRenter currentRenter = spaceRenterService.getSpaceRenterByUsername(username);
        
        // Check if the current user owns this locality
        if (locality.getSpaceRenter() == null || 
            !locality.getSpaceRenter().getId().equals(currentRenter.getId())) {
            throw new AccessDeniedException("You don't have permission to modify rooms in this locality");
        }
    }
}