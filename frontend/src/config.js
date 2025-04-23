// Configuration settings for the application

// Get the API base URL from the environment or use localhost as default
const isProd = window.location.hostname !== "localhost";

// In production/Docker, we use relative URLs
// In development, we use absolute URLs with localhost
export const API_BASE_URL = isProd ? '' : 'http://localhost:8080';