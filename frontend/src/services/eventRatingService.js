import { authenticatedRequest } from './authService';
import { API_BASE_URL } from '../config';

const API_BASE_URL_PATH = API_BASE_URL;

export const eventRatingService = {
  getEventRating: async (eventId) => {
    try {
      const response = await authenticatedRequest(
        'GET', 
        true, 
        `${API_BASE_URL_PATH}/api/ratings/event/${eventId}`
      );
      
      // The API now returns an object with average and count
      if (typeof response.data === 'object' && response.data.average !== undefined) {
        return response.data;
      }
      
      // Fallback for backward compatibility if API returns just a number
      return response.data || 0;
    } catch (error) {
      console.error('Error fetching event rating:', error);
      return { average: 0, count: 0 };
    }
  },
  
  getEventRatingStats: async (eventId) => {
    try {
      const response = await authenticatedRequest(
        'GET', 
        true, 
        `${API_BASE_URL_PATH}/api/ratings/event/${eventId}/stats`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching event rating stats:', error);
      return { average: 0, count: 0, distribution: {} };
    }
  },
  
  getUserRatingForEvent: async (eventId) => {
    try {
      const response = await authenticatedRequest(
        'GET', 
        true, 
        `${API_BASE_URL_PATH}/api/ratings/event/${eventId}/user`
      );
      return response.data.rating || 0;
    } catch (error) {
      console.error('Error fetching user rating:', error);
      return 0;
    }
  },
  
  rateEvent: async (eventId, rating) => {
    return await authenticatedRequest(
      'POST', 
      true, 
      `${API_BASE_URL_PATH}/api/ratings/event/${eventId}`, 
      { rating: rating }
    );
  }
};
