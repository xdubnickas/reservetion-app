import axios from 'axios';
import { getUserPreferences as fetchUserPreferences } from './preferencesService';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/auth`;
let TOKEN_KEY = 'jwtToken';
let USER_ROLE_KEY = 'userRole';
let USER_NAME_KEY = 'userName';

const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

const setUserRole = (role) => {
  localStorage.setItem(USER_ROLE_KEY, role);
};

const getUserRole = () => {
  return localStorage.getItem(USER_ROLE_KEY);
};

const setUserName = (username) => {
  localStorage.setItem(USER_NAME_KEY, username);
};

const getUserName = () => {
  return localStorage.getItem(USER_NAME_KEY);
};

const register = async (userData) => {
  const payload = {
    username: userData.username,
    password: userData.password,
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    role: userData.userType,
    phoneNumber: userData.phone,
    companyName: userData.companyName
  };

  console.log('Registering data:', payload);
  
  const response = await axios.post(`${API_URL}/register`, payload);
  
  console.log('Response received:', response.data);
  
  if (response.data) {
    // Store the token and user info
    setToken(response.data.token);
    setUserRole(response.data.role);
    setUserName(userData.username);
    return response.data.role;  // Return role for redirect
  }
};

const login = async (username, password) => {
  const response = await axios.post(`${API_URL}/login`, {
    username,
    password
  });

  console.log('Login received:', response.data);
  if (response.data) {
    setToken(response.data.token);
    setUserRole(response.data.role);
    setUserName(username);
    
    // Only fetch preferences if the user is a REGISTERED_USER
    if (response.data.role === 'REGISTERED_USER') {
      try {
        const preferences = await fetchUserPreferences();
        if (preferences) {
          // Save to localStorage for offline access
          localStorage.setItem('userPreferences', JSON.stringify(preferences));
        }
      } catch (error) {
        console.error('Error fetching preferences during login:', error);
        // Continue with login process even if preferences fetch fails
      }
    }
    
    // Dispatch custom event for login to notify components
    const loginEvent = new CustomEvent('userLoggedIn', {
      detail: { role: response.data.role }
    });
    window.dispatchEvent(loginEvent);
    
    return response.data.role;
  }
};

const logout = (isExpired = false) => {
  removeToken();
  localStorage.removeItem(USER_ROLE_KEY);
  localStorage.removeItem(USER_NAME_KEY);
  localStorage.removeItem('userPreferences');
  
  // Dispatch a custom event that components can listen for
  const logoutEvent = new CustomEvent('userLoggedOut', { 
    detail: { reason: isExpired ? 'expired' : 'manual' } 
  });
  window.dispatchEvent(logoutEvent);
  
  // If token expired, navigate to login page
  if (isExpired && window.location.pathname !== '/signup') {
    window.location.href = '/signup';
  }
};

const authenticatedRequest = async (method, useAuth, url, data = null) => {
  const headers = {};

  if (useAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    console.log(`Performing ${method} request to:`, url, { data });

    let response;
    switch (method) {
      case 'GET':
        response = await axios.get(url, { headers });
        console.log(url,' response data:', response.data);
        return response;
      case 'POST':
        return await axios.post(url, data, { headers });
      case 'PUT':
        return await axios.put(url, data, { headers });
      case 'DELETE':
        return await axios.delete(url, { headers });
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  } catch (error) {
    if (useAuth && error.response?.status === 401) {
      //logout(true);
      
      // Throw a specific error with a message that can be displayed to the user
      const expiredError = new Error('Your session has expired. Please log in again.');
      expiredError.isExpired = true;
      throw expiredError;
    }
    throw error;
  }
};

// Add this function to check token validity
const validateToken = async () => {
  const token = getToken();
  
  // If no token exists, user is not logged in
  if (!token) {
    return false;
  }
  
  try {
    // Make a request to a protected endpoint to validate the token
    await axios.get(`${API_URL}/validate-token`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return true; // Token is valid
  } catch (error) {
    // If we get 401 Unauthorized, token is invalid or expired
    if (error.response?.status === 401) {
      // Clean up invalid authentication data
      logout(true);
      return false;
    }
    
    // For other errors (like network issues), we'll assume the token might still be valid
    // to prevent unnecessary logouts during temporary API issues
    console.error('Error validating token:', error);
    return true;
  }
};

export { register, login, logout, setToken, getToken, removeToken, authenticatedRequest, getUserRole, getUserName, validateToken };