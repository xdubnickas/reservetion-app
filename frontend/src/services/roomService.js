import { authenticatedRequest } from './authService';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api`;

export const roomService = {
  getRoomsByLocality: async (localityId) => {
    const response = await authenticatedRequest(
      'GET', 
      true, 
      `${API_URL}/localities/${localityId}/rooms`
    );
    return response.data;
  },

  createRoom: async (localityId, roomData) => {
    const response = await authenticatedRequest(
      'POST', 
      true, 
      `${API_URL}/localities/${localityId}/rooms`, 
      roomData
    );
    return response.data;
  },

  updateRoom: async (localityId, roomId, roomData) => {
    const response = await authenticatedRequest(
      'PUT', 
      true, 
      `${API_URL}/localities/${localityId}/rooms/${roomId}`, 
      roomData
    );
    return response.data;
  },

  deleteRoom: async (localityId, roomId) => {
    return authenticatedRequest(
      'DELETE', 
      true, 
      `${API_URL}/localities/${localityId}/rooms/${roomId}`
    );
  }
};
