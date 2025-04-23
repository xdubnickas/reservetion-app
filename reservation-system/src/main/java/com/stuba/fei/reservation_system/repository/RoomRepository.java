package com.stuba.fei.reservation_system.repository;

import com.stuba.fei.reservation_system.model.Locality;
import com.stuba.fei.reservation_system.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findAllByLocality(Locality locality);
}