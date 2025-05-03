import { getInitials, stringToColor } from '../../utils/imageUtils';
import '../../styles/EventImagePlaceholder.css';
import PropTypes from 'prop-types';

const EventImagePlaceholder = ({ name, className, icon }) => {
  const initials = getInitials(name || 'Event');
  const backgroundColor = stringToColor(name || 'Event');
  
  return (
    <div 
      className={`event-image-placeholder ${className || ''}`} 
      style={{ backgroundColor }}
    >
      {icon ? (
        <span className="placeholder-icon">{icon}</span>
      ) : (
        <span className="image-placeholder-text">{initials}</span>
      )}
    </div>
  );
};

EventImagePlaceholder.propTypes = {
  name: PropTypes.string,
  className: PropTypes.string,
  icon: PropTypes.node,
};

export default EventImagePlaceholder;
