import axios from 'axios';
import { getToken } from './authService';
import { API_BASE_URL } from '../config';

const API_BASE_URL_PATH = API_BASE_URL;

export const getUserReservations = async () => {
  const token = getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const response = await axios.get(
    `${API_BASE_URL_PATH}/api/reservations/user`, 
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  console.log('User Reservations:', response.data); // Debugging line
  return response.data;
};

export const createReservation = async (eventId) => {
  const token = getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const response = await axios.post(
    `${API_BASE_URL_PATH}/api/reservations`, 
    { eventId }, 
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  return response.data;
};

export const cancelReservation = async (reservationId) => {
  const token = getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const response = await axios.put(
    `${API_BASE_URL_PATH}/api/reservations/${reservationId}/cancel`, 
    {}, 
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  return response.data;
};
