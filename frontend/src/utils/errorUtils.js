/**
 * Standardized API error handling utility
 * @param {Error} error - The error object from axios or other source
 * @returns {Promise} - Rejected promise with standardized error message
 */
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  // Default error message
  let errorMessage = 'An unexpected error occurred. Please try again.';
  
  if (error.response) {
    // The request was made and the server responded with an error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        errorMessage = data.message || 'Bad request. Please check your input.';
        break;
      case 401:
        errorMessage = 'Unauthorized. Please log in again.';
        break;
      case 403:
        errorMessage = 'You do not have permission to perform this action.';
        break;
      case 404:
        errorMessage = 'The requested resource was not found.';
        break;
      case 409:
        errorMessage = data.message || 'A conflict occurred with the current state.';
        break;
      case 422:
        errorMessage = data.message || 'Validation failed. Please check your input.';
        break;
      case 500:
      case 502:
      case 503:
        errorMessage = 'Server error. Please try again later.';
        break;
      default:
        errorMessage = data.message || errorMessage;
    }
  } else if (error.request) {
    // The request was made but no response was received
    errorMessage = 'No response from server. Please check your internet connection.';
  }
  
  return Promise.reject(errorMessage);
};
