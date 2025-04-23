import {useEffect } from 'react';
import { Modal, Button, Badge } from 'react-bootstrap';
import { format } from 'date-fns';
import { BsCalendar3, BsClock, BsPeople, BsCash, BsGeoAlt, BsImage, BsDoorOpen } from 'react-icons/bs';
import PropTypes from 'prop-types';
import '../../styles/DetailEventModal.css';
import { eventCategories } from '../../utils/categoryData';
import { useNavigate } from 'react-router-dom';
import { eventRatingService } from '../../services/eventRatingService';

const DetailEventModal = ({ show, onHide, event }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (show && event) {
      const fetchEventRating = async () => {
        try {
          await eventRatingService.getEventRating(event.id);
        } catch (error) {
          console.error('Error fetching event rating:', error);
        }
      };
      
      fetchEventRating();
    }
  }, [show, event]);
  
  if (!event) return null;

  const hasImage = event.imagePath && event.imagePath.trim() !== '';
  const eventLocality = event.rooms && event.rooms.length > 0 ? event.rooms[0].locality : null;

  const handleViewFullDetails = () => {
    navigate(`/event/${event.id}`);
    onHide();
  };

  const getCategoryColor = (category) => {
    const colors = {
      Music: 'primary',
      Sports: 'success',
      Theater: 'danger',
      Conference: 'info',
      Workshop: 'warning',
      Fun: 'primary',
      Business: 'info',
      Technology: 'dark',
      'Food & Drink': 'success',
      'Art & Culture': 'danger',
      'Health & Wellness': 'success',
      Education: 'info',
      Charity: 'secondary',
      Fashion: 'pink'
    };
    
    if (colors[category]) return colors[category];
    
    const fallbackColors = ['primary', 'success', 'danger', 'warning', 'info'];
    const index = eventCategories.indexOf(category) % fallbackColors.length;
    return fallbackColors[index >= 0 ? index : 0];
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'ACTIVE': return 'Active';
      case 'FULL': return 'Full';
      case 'INACTIVE': return 'Inactive';
      default: return status;
    }
  };

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'ACTIVE': return 'success';
      case 'FULL': return 'warning';
      case 'INACTIVE': return 'secondary';
      default: return 'light';
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" className="event-detail-modal">
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2">
          {event.name}
          <Badge bg={getCategoryColor(event.category)}>{event.category}</Badge>
          {event.status && (
            <Badge bg={getStatusBadgeColor(event.status)} className="ms-1">
              {getStatusText(event.status)}
            </Badge>
          )}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-4">
        <div className="event-image-container mb-4">
          {hasImage ? (
            <img 
              src={`http://localhost:8080${event.imagePath.startsWith('/') ? event.imagePath : '/' + event.imagePath}`}
              alt={event.name} 
              className="event-detail-image"
            />
          ) : (
            <div className="event-image-placeholder">
              <BsImage size={40} />
              <span>No image available</span>
            </div>
          )}
        </div>

        <div className="event-content">
          <div className="event-info-grid">
            <EventInfo 
              icon={BsCalendar3}
              label="Date"
              value={format(new Date(event.eventDate), 'PPP')}
            />
            <EventInfo 
              icon={BsClock}
              label="Time"
              value={`${event.startTime} (${event.duration} minutes)`}
            />
            <EventInfo 
              icon={BsPeople}
              label="Capacity"
              value={`${event.reservations ? event.reservations.length : 0}/${event.maxCapacity} people`}
            />
            <EventInfo 
              icon={BsCash}
              label="Price"
              value={`€${Number(event.price).toFixed(2)}`}
            />
          </div>

          {event.description && (
            <div className="event-description">
              <h6>About This Event</h6>
              <p>{event.description}</p>
            </div>
          )}

          {eventLocality && (
            <div className="event-location">
              <div className="location-header">
                <BsGeoAlt className="location-icon" />
                <h6>Location</h6>
              </div>
              <div className="location-content">
                <div className="location-details">
                  <strong>{eventLocality.name}</strong>
                  <p>{eventLocality.address}</p>
                  <p className="mb-0">
                    {eventLocality.city && typeof eventLocality.city === 'object'
                      ? `${eventLocality.city.name}, ${eventLocality.city.country}`
                      : eventLocality.city}
                  </p>
                </div>
                <div className="location-map">
                  <div className="event-map-container">
                    <iframe
                      title="Event Location"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(
                        `${eventLocality.address}, ${typeof eventLocality.city === 'object' 
                          ? `${eventLocality.city.name}, ${eventLocality.city.country}`
                          : eventLocality.city}`
                      )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                      frameBorder="0"
                      scrolling="no"
                      marginHeight="0"
                      marginWidth="0"
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
          )}

          {event.rooms && event.rooms.length > 0 && (
            <div className="event-rooms mt-4">
              <div className="rooms-header">
                <BsDoorOpen className="rooms-icon" />
                <h6>Rooms</h6>
              </div>
              <div className="rooms-list">
                {event.rooms.map(room => (
                  <div key={room.id} className="room-item">
                    <span className="room-name">{room.name}</span>
                    <div className="event-room-details">
                      <span>Floor: {room.floor}</span>
                      <span>Capacity: {room.capacity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={handleViewFullDetails}>View Event Page</Button>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

DetailEventModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    imagePath: PropTypes.string,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    eventDate: PropTypes.string.isRequired,
    startTime: PropTypes.string.isRequired,
    duration: PropTypes.number.isRequired,
    maxCapacity: PropTypes.number.isRequired,
    price: PropTypes.number.isRequired,
    description: PropTypes.string,
    status: PropTypes.string,
    reservations: PropTypes.array,
    rooms: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        floor: PropTypes.number.isRequired,
        capacity: PropTypes.number.isRequired,
        locality: PropTypes.shape({
          name: PropTypes.string.isRequired,
          address: PropTypes.string.isRequired,
          city: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({
              name: PropTypes.string.isRequired,
              country: PropTypes.string
            })
          ]).isRequired
        }).isRequired
      })
    ).isRequired
  })
};

const EventInfo = ({ icon: Icon, label, value }) => (
  <div className="event-info-item">
    <Icon className="info-icon" />
    <div className="info-content">
      <div className="info-label">{label}</div>
      <div className="info-value">{value}</div>
    </div>
  </div>
);

EventInfo.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired
};

export default DetailEventModal;
