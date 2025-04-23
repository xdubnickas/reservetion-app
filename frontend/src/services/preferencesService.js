import { authenticatedRequest } from './authService';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/preferences`;
const USER_PREFERENCES_KEY = 'userPreferences';

/**
 * Store preferences in localStorage
 * @param {Object} preferences The preferences to save
 */
const setLocalPreferences = (preferences) => {
  localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences));
};

/**
 * Get preferences from localStorage
 * @returns {Object|null} The stored preferences or null if not found
 */
const getLocalPreferences = () => {
  const prefs = localStorage.getItem(USER_PREFERENCES_KEY);
  return prefs ? JSON.parse(prefs) : null;
};

/**
 * Remove preferences from localStorage
 */
const removeLocalPreferences = () => {
  localStorage.removeItem(USER_PREFERENCES_KEY);
};

/**
 * Get preferences for the currently logged in user
 */
const getUserPreferences = async () => {
  try {
    const response = await authenticatedRequest('GET', true, API_URL);
    // Also save to localStorage for offline access
    setLocalPreferences(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    // Return localStorage preferences on error
    return getLocalPreferences();
  }
};

/**
 * Save preferences for the currently logged in user
 * @param {Object} preferences The preferences to save
 */
const saveUserPreferences = async (preferences) => {
  try {
    // Save to localStorage first (optimistic update)
    setLocalPreferences(preferences);
    const response = await authenticatedRequest('POST', true, API_URL, preferences);
    return response.data;
  } catch (error) {
    console.error('Error saving user preferences:', error);
    throw error;
  }
};

export { 
  getUserPreferences, 
  saveUserPreferences, 
  getLocalPreferences, 
  setLocalPreferences, 
  removeLocalPreferences 
};
