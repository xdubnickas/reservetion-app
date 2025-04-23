package com.stuba.fei.reservation_system.config;

import com.stuba.fei.reservation_system.service.EventStatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

import jakarta.annotation.PostConstruct;

@Configuration
@EnableScheduling
public class ScheduledConfig {

    @Autowired
    private EventStatusService eventStatusService;

    /**
     * Update event statuses when the application starts up
     * This is the only time we update event statuses automatically
     */
    @PostConstruct
    public void updateEventStatusesOnStartup() {
        System.out.println("Application startup: Updating event statuses...");
        int updatedCount = eventStatusService.updateAllEventStatuses();
        System.out.println("Application startup: Updated status for " + updatedCount + " events");
    }
}
