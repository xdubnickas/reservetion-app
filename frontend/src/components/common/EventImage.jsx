import { useState } from 'react';
import { Image } from 'react-bootstrap';
import PropTypes from 'prop-types';

const EventImage = ({ event, className }) => {
  const [error, setError] = useState(false);
  
  // Placeholder image when no image is available or loading fails
  const placeholderImage = '/images/event-placeholder.jpg';
  
  const imageSrc = event.imagePath
    ? `http://localhost:8080${event.imagePath.startsWith('/') ? event.imagePath : '/' + event.imagePath}`
    : placeholderImage;

  return (
    <Image
      src={error ? placeholderImage : imageSrc}
      alt={event.name}
      className={className}
      onError={() => setError(true)}
      fluid
    />
  );
};

EventImage.propTypes = {
  event: PropTypes.shape({
    imagePath: PropTypes.string,
    name: PropTypes.string.isRequired
  }).isRequired,
  className: PropTypes.string
};

export default EventImage;
