import { useEffect } from 'react';
import { validateToken } from '../../services/authService';

/**
 * Component that validates the authentication token on application startup
 * and at regular intervals to ensure the user is properly logged out when
 * their token expires.
 */
const AuthValidator = () => {
  useEffect(() => {
    // Validate token immediately on component mount
    const checkToken = async () => {
      await validateToken();
    };
    
    checkToken();
    
    // Set up periodic token validation (every 5 minutes)
    const intervalId = setInterval(checkToken, 5 * 60 * 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  // This component doesn't render anything
  return null;
};

export default AuthValidator;
