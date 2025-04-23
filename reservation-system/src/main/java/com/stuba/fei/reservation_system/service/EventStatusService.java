package com.stuba.fei.reservation_system.service;

import com.stuba.fei.reservation_system.model.Event;
import com.stuba.fei.reservation_system.model.EventStatus;
import com.stuba.fei.reservation_system.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EventStatusService {

    @Autowired
    private EventRepository eventRepository;

    /**
     * Update all event statuses and return the count of updated events
     * 
     * @return The number of events whose status was updated
     */
    @Transactional
    public int updateAllEventStatuses() {
        List<Event> allEvents = eventRepository.findAll();
        int updatedCount = 0;

        for (Event event : allEvents) {
            EventStatus oldStatus = event.getStatus();
            event.updateStatus();
            if (oldStatus != event.getStatus()) {
                eventRepository.save(event);
                updatedCount++;
            }
        }
        
        return updatedCount;
    }
}
