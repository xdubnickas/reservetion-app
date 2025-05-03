import { authenticatedRequest, getUserName } from './authService';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api`;

export const localityService = {
  getMyLocalities: async () => {
    const username = getUserName();
    const response = await authenticatedRequest('GET', true, `${API_URL}/localities/user/${username}`);
    // Handle the response to ensure we get the right data structure
    return response.data.map(locality => ({
      id: locality.id,
      name: locality.name,
      address: locality.address,
      city: locality.city,
      totalCapacity: locality.totalCapacity
    }));
  },

  createLocality: (localityData) => {
    // Parse city and country from the city string (format: "City, CountryName")
    const cityParts = localityData.city.split(',');
    const cityName = cityParts[0].trim();
    const country = cityParts.length > 1 ? cityParts[1].trim() : 'Slovakia';

    // Properly format data to match LocalityRequest structure
    const formattedData = {
      name: localityData.name,
      address: localityData.address,
      totalCapacity: parseInt(localityData.totalCapacity),
      city: {
        name: cityName,
        country: country
      }
    };
    
    console.log("POST locality data:", formattedData);
    return authenticatedRequest('POST', true, `${API_URL}/localities`, formattedData);
  },

  updateLocality: (id, localityData) => {
    // Parse city and country from the city string (format: "City, CountryName")
    const cityParts = localityData.city.split(',');
    const cityName = cityParts[0].trim();
    const country = cityParts.length > 1 ? cityParts[1].trim() : 'Slovakia';

    // Properly format data to match LocalityRequest structure
    const formattedData = {
      name: localityData.name,
      address: localityData.address,
      totalCapacity: parseInt(localityData.totalCapacity),
      city: {
        name: cityName,
        country: country
      }
    };
    
    console.log("PUT locality data:", formattedData);
    return authenticatedRequest('PUT', true, `${API_URL}/localities/${id}`, formattedData);
  },
  
  deleteLocality: (id) => 
    authenticatedRequest('DELETE', true, `${API_URL}/localities/${id}`),

  getAllLocalities: async () => {
    const response = await authenticatedRequest('GET', false, `${API_URL}/localities`);
    return response.data;
  },

  getLocality: async (id) => {
    const response = await authenticatedRequest('GET', false, `${API_URL}/localities/${id}`);
    return response.data;
  },

  getAllCities: async () => {
    const response = await authenticatedRequest('GET', true, `${API_URL}/localities`);
    // Extract unique city names from localities - city is now always an object
    const cityNames = response.data.map(locality => locality.city.name);
    // Remove duplicates
    const uniqueCities = [...new Set(cityNames)];
    return uniqueCities.sort();
  },

  getAllSpaceRenters: async () => {
    const response = await authenticatedRequest('GET', false, `${API_URL}/space-renters`);
    return response.data;
  },

  getEventCountsByLocality: async (id) => {
    const response = await authenticatedRequest('GET', true, `${API_URL}/localities/${id}/event-counts`);
    return response.data;
  }
};
