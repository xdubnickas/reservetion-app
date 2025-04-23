package com.stuba.fei.reservation_system.dto;

import com.stuba.fei.reservation_system.model.Reservation;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
public class ReservationResponse {
    private Long id;
    private Long eventId;
    private String eventName;
    private String eventDescription;
    private LocalDate eventDate;
    private LocalTime eventStartTime;
    private LocalTime eventEndTime;
    private int eventDuration;
    private Double eventPrice;
    private String eventCategory;
    private String eventStatus;
    private String eventImagePath;
    private LocalDateTime reservationDate;
    private String status;
    
    public static ReservationResponse fromReservation(Reservation reservation) {
        ReservationResponse response = new ReservationResponse();
        response.setId(reservation.getId());
        response.setReservationDate(reservation.getReservationDate());
        response.setStatus(reservation.getStatus().name());
        
        // Event details
        if (reservation.getEvent() != null) {
            response.setEventId(reservation.getEvent().getId());
            response.setEventName(reservation.getEvent().getName());
            response.setEventDescription(reservation.getEvent().getDescription());
            response.setEventDate(reservation.getEvent().getEventDate());
            response.setEventStartTime(reservation.getEvent().getStartTime());
            response.setEventEndTime(reservation.getEvent().getEndTime());
            response.setEventDuration(reservation.getEvent().getDuration());
            response.setEventPrice(reservation.getEvent().getPrice());
            response.setEventCategory(reservation.getEvent().getCategory());
            response.setEventStatus(reservation.getEvent().getStatus().name());
            response.setEventImagePath(reservation.getEvent().getImagePath());
        }
        
        return response;
    }
}
