// AuthRedirect.jsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getToken, getUserRole } from '../../services/authService';

const AuthRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = getToken();
    const userRole = getUserRole();
    
    if (token && location.pathname === '/') {
      switch(userRole) {
        case 'SPACE_RENTER':
          navigate('/space-renter');
          break;
        case 'EVENT_ORGANIZER':
          navigate('/event-organizer');
          break;
        case 'ADMIN':
          navigate('/admin');
          break;
        default:
          break;
      }
    }
  }, [navigate, location]);

  return null;
};

export default AuthRedirect;
