import { authenticatedRequest } from './authService';
import axios from 'axios';
import { handleApiError } from '../utils/errorUtils';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api`;

export const eventService = {
  getMyEvents: async () => {
    const response = await authenticatedRequest('GET', true, `${API_URL}/events/my`);
    return response.data;
  },

  createEvent: async (eventData) => {
    const formData = new FormData();
    Object.keys(eventData).forEach(key => {
      formData.append(key, eventData[key]);
    });
    return authenticatedRequest('POST', true, `${API_URL}/events`, formData);
  },

  updateEvent: async (id, eventData) => {
    const formData = new FormData();
    
    formData.append('name', eventData.name);
    formData.append('description', eventData.description || '');
    formData.append('category', eventData.category);
    formData.append('maxCapacity', eventData.maxCapacity);
    formData.append('price', eventData.price);
    formData.append('eventDate', eventData.eventDate);
    formData.append('startTime', eventData.startTime);  // Zmenené z time na startTime
    formData.append('duration', eventData.duration);  // Pridáme duration

    // Add roomIds as array
    eventData.roomIds.forEach((roomId) => {
      formData.append('roomIds', roomId);
    });

    if (eventData.image) {
      formData.append('image', eventData.image);
    }
    console.log("PUT event data:", eventData);

    return authenticatedRequest('PUT', true, `${API_URL}/events/${id}`, formData);
  },

  deleteEvent: async (id) => {
    return authenticatedRequest('DELETE', true, `${API_URL}/events/${id}`);
  },

  createEventWithDetails: async (eventData) => {
    const formData = new FormData();
    
    formData.append('name', eventData.name);
    formData.append('description', eventData.description || '');
    formData.append('category', eventData.category);
    formData.append('maxCapacity', eventData.maxCapacity);
    formData.append('price', eventData.price);
    formData.append('eventDate', eventData.eventDate);
    formData.append('startTime', eventData.startTime);  // Zmenené z time na startTime
    formData.append('duration', eventData.duration);  // Pridáme duration

    // Add roomIds as array
    eventData.roomIds.forEach((roomId) => {
      formData.append('roomIds', roomId);
    });

    if (eventData.image) {
      formData.append('image', eventData.image);
    }
    
    console.log("POST event data:", eventData);
    return authenticatedRequest('POST', true, `${API_URL}/events`, formData);
  },

  getOccupiedTimes: async (roomIds, date, excludeEventId = null) => {
    // Vytvoríme query string z poľa roomIds
    const roomIdsQuery = roomIds.map(id => `roomIds=${id}`).join('&');
    let url = `${API_URL}/events/occupied-times?${roomIdsQuery}&date=${date}`;
    
    // Pridaj excludeEventId parameter ak je poskytnutý
    if (excludeEventId) {
      url += `&excludeEventId=${excludeEventId}`;
    }
    
    try {
      const response = await authenticatedRequest('GET', true, url);
      return response;
    } catch (error) {
      console.error('Error fetching occupied times:', error);
      throw error;
    }
  },

  getUpcomingEvents: async () => {
    const response = await authenticatedRequest('GET', false, `${API_URL}/events/upcoming`);
    return response.data;
  },

  createReservation: async (eventId) => {
    try {
      const reservationData = {
        eventId: eventId
      };
      
      const response = await authenticatedRequest('POST', true, `${API_URL}/reservations`, reservationData);
      return response.data;
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }
  },

  getSuggestedEvents: async (longitude, latitude) => {
    let url = `${API_URL}/events/suggested`;
    
    // Add coordinates as query parameters if available
    if (longitude !== null && latitude !== null) {
      url += `?longitude=${longitude}&latitude=${latitude}`;
    }
    
    const response = await authenticatedRequest('GET', true, url);
    return response.data;
  },

  // Get specific event by ID
  getEventById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/events/${id}`);
      console.log('Event details:', response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
