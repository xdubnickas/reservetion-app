import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getToken, getUserRole } from '../../services/authService';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = getToken();
  const userRole = getUserRole();

  if (!token) {
    return <Navigate to="/signup" />;
  }

  if (allowedRoles.includes(userRole)) {
    return children;
  }

  return <Navigate to="/" />;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ProtectedRoute;