import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, ProgressBar } from 'react-bootstrap';
import { 
  FaMapMarkerAlt, 
  FaRegCalendarAlt, 
  FaChevronLeft, 
  FaTag, 
  FaClock, 
  FaUsers, 
  FaUser, 
  FaBuilding, 
  FaPhone, 
  FaEnvelope, 
  FaGlobe,
  FaDoorOpen,
  FaTicketAlt,
  FaInfoCircle,
  FaCalendarCheck,
  FaStar,
  FaStarHalfAlt,
  FaRegStar
} from 'react-icons/fa';
import { eventService } from '../services/eventService';
import moment from 'moment';
import { hasValidImage } from '../utils/imageUtils';
import EventImagePlaceholder from '../components/common/EventImagePlaceholder';
import ReserveButton from '../components/features/events/ReserveButton';
import '../styles/EventDetailPage.css';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const eventData = await eventService.getEventById(id);
        console.log('Event details:', eventData);
        setEvent(eventData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details');
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) return (
    <Container className="my-5 text-center">
      <h3>Loading event details...</h3>
    </Container>
  );

  if (error) return (
    <Container className="my-5 text-center">
      <h3>Error: {error}</h3>
      <Button variant="primary" onClick={handleGoBack}>Back to Events</Button>
    </Container>
  );

  if (!event) return (
    <Container className="my-5 text-center">
      <h3>Event not found</h3>
      <Button variant="primary" onClick={handleGoBack}>Back to Events</Button>
    </Container>
  );

  const category = event.category || 'Event';
  const venue = event.rooms && event.rooms.length > 0 ? event.rooms[0].locality.name : 'Venue not specified';
  const localityId = event.rooms && event.rooms.length > 0 ? event.rooms[0].locality.id : null;
  const address = event.rooms && event.rooms.length > 0 ? 
    `${event.rooms[0].locality.address}, ${event.rooms[0].locality.city.name}, ${event.rooms[0].locality.city.country}` : 'Address not available';
  const room = event.rooms && event.rooms.length > 0 ? event.rooms[0].name : 'Room not specified';
  const reservationCount = event.reservations ? event.reservations.length : 0;
  
  // Calculate end time from start time and duration
  const startTime = moment(event.startTime, 'HH:mm');
  const endTime = event.endTime ? moment(event.endTime, 'HH:mm:ss') : 
                 (event.duration ? startTime.clone().add(event.duration, 'minutes') : null);
  const duration = event.duration ? `${Math.floor(event.duration / 60)}h ${event.duration % 60}min` : 'Not specified';

  // Event organizer details
  const organizer = event.eventOrganizer || null;
  
  // Render star rating based on average rating
  const renderStarRating = (rating) => {
    if (rating === undefined || rating === null) return null;
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="event-detail-organizer-rating">
        {[...Array(fullStars)].map((_, i) => <FaStar key={`full-${i}`} className="text-warning" />)}
        {hasHalfStar && <FaStarHalfAlt className="text-warning" />}
        {[...Array(emptyStars)].map((_, i) => <FaRegStar key={`empty-${i}`} className="text-warning" />)}
        <span className="ms-2 rating-value">({rating.toFixed(1)})</span>
      </div>
    );
  };
  
  // Location details
  const location = event.rooms && event.rooms.length > 0 ? event.rooms[0].locality : null;
  const spaceRenter = location ? location.spaceRenter : null;

  // Navigate to locality detail page
  const handleLocalityClick = () => {
    if (localityId) {
      navigate(`/localities/${localityId}`);
    }
  };

  return (
    <Container className="my-4 event-detail-container container-fluid">
      <div className="event-detail-header mb-4">
        <Button 
          variant="outline-primary" 
          className="event-detail-back-button d-flex align-items-center"
          onClick={handleGoBack}
        >
          <FaChevronLeft className="me-2" /> Back to Events
        </Button>
      </div>
      
      <div className="event-detail-hero mb-5">
        <Row className="g-0">
          <Col lg={7} className="event-detail-hero-image-col">
            <div className="event-detail-hero-wrapper">
              {hasValidImage(event.imagePath) ? (
                <div className="event-detail-hero-image-container">
                  <img 
                    src={`http://localhost:8080/${event.imagePath}`}
                    alt={event.name}
                    className="event-detail-hero-image"
                  />
                </div>
              ) : (
                <div className="event-detail-hero-image-placeholder">
                  <EventImagePlaceholder name={event.name} />
                </div>
              )}
            </div>
          </Col>
          <Col lg={5} className="event-detail-hero-details-col">
            <div className="event-detail-hero-content">
              <div className="d-flex flex-wrap justify-content-between align-items-start mb-3">
                <Badge bg="primary" className="category-badge">
                  <FaTag className="me-1" /> {category}
                </Badge>
                <Badge bg="info" className="price-badge fs-5 px-3 py-2">
                  {event.price} €
                </Badge>
              </div>
              
              <h1 className="event-detail-title mb-3">{event.name}</h1>
              
              <div className="event-detail-info-grid">
                <div className="event-detail-info-item">
                  <div className="event-detail-info-icon"><FaRegCalendarAlt /></div>
                  <div className="event-detail-info-content">
                    <span className="event-detail-info-date">{moment(event.eventDate).format('dddd, MMM D, YYYY')}</span>
                  </div>
                </div>
                
                <div className="event-detail-info-item">
                  <div className="event-detail-info-icon"><FaClock /></div>
                  <div className="event-detail-info-content">
                    <span className="event-detail-info-time">
                      {startTime.format('HH:mm')} - {endTime ? endTime.format('HH:mm') : 'Not specified'} 
                      {event.duration ? ` (${duration})` : ''}
                    </span>
                  </div>
                </div>
                
                <div className="event-detail-info-item">
                  <div className="event-detail-info-icon"><FaMapMarkerAlt /></div>
                  <div className="event-detail-info-content">
                    {localityId ? (
                      <span 
                        className="event-detail-info-location clickable-venue"
                        onClick={handleLocalityClick}
                        title="Click to view venue details"
                      >
                        {venue}
                      </span>
                    ) : (
                      <span className="event-detail-info-location">{venue}</span>
                    )}
                  </div>
                </div>
                
                <div className="event-detail-info-item">
                  <div className="event-detail-info-icon"><FaUsers /></div>
                  <div className="event-detail-info-content">
                    <span className="event-detail-info-capacity">{event.maxCapacity} people</span>
                  </div>
                </div>
              </div>
              
              <div className="event-detail-reserve-cta mt-auto">
                <ReserveButton 
                  event={event} 
                  size="lg" 
                  className="event-detail-reserve-button"
                />
                <div className="event-detail-reservation-note">
                  <FaCalendarCheck className="me-2" /> Easy online reservation - Book now!
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
      
      <div className="event-detail-sections">
        {/* About This Event and Event Organizer side by side */}
        <Row className="mb-5 gx-4">
          <Col lg={7}>
            <Card className="event-detail-description-card mb-4 h-100">
              <Card.Header className="event-detail-description-header">
                <h3 className="event-detail-section-title mb-0"><FaInfoCircle className="me-2" /> About This Event</h3>
              </Card.Header>
              <Card.Body>
                <Card.Text className="event-detail-description">{event.description}</Card.Text>
                
                {/* Availability section moved here */}
                <div className="event-detail-availability-section mt-4 pt-3 border-top">
                  <h5 className="event-detail-availability-title">
                    <FaTicketAlt className="me-2" /> Ticket Availability
                  </h5>
                  
                  <div className="d-flex justify-content-between mb-2">
                    <span>{reservationCount} / {event.maxCapacity} tickets reserved</span>
                    <span>{Math.round((reservationCount/event.maxCapacity) * 100)}% booked</span>
                  </div>
                  
                  <ProgressBar 
                    variant={reservationCount/event.maxCapacity > 0.75 ? "danger" : 
                             reservationCount/event.maxCapacity > 0.5 ? "warning" : "success"}
                    now={Math.round((reservationCount/event.maxCapacity) * 100)} 
                    className="event-detail-ticket-progress"
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={5}>
            <Card className="event-detail-organizer-card h-100">
              <Card.Header className="bg-success text-white">
                <h4 className="mb-0"><FaUser className="me-2" /> Event Organizer</h4>
              </Card.Header>
              <Card.Body className="p-0">
                {organizer ? (
                  <>
                    <div className="p-3 border-bottom">
                      <div className="event-detail-organizer-avatar-container mb-3">
                        <div className="event-detail-organizer-avatar">
                          {organizer.firstName.charAt(0)}{organizer.lastName.charAt(0)}
                        </div>
                      </div>
                      <h5 className="event-detail-organizer-name text-center mb-1">
                        {organizer.firstName} {organizer.lastName}
                      </h5>
                      {organizer.organizationName && (
                        <div className="event-detail-organizer-company text-center">
                          <FaBuilding className="me-1 text-muted" />
                          {organizer.organizationName}
                        </div>
                      )}
                      {organizer.averageRating !== undefined && (
                        <div className="text-center mt-2">
                          {renderStarRating(organizer.averageRating)}
                        </div>
                      )}
                    </div>
                    
                    <div className="event-detail-contact-section">
                      <h6 className="text-muted text-center mb-3">Contact Information</h6>
                      <div className="event-detail-contact-item">
                        <div className="event-detail-contact-icon">
                          <FaEnvelope className="text-muted" />
                        </div>
                        <div className="event-detail-contact-text">
                          <a href={`mailto:${organizer.email}`}>{organizer.email}</a>
                        </div>
                      </div>
                      {organizer.mobilePhoneNumber && (
                        <div className="event-detail-contact-item">
                          <div className="event-detail-contact-icon">
                            <FaPhone className="text-muted" />
                          </div>
                          <div className="event-detail-contact-text">
                            <a href={`tel:${organizer.mobilePhoneNumber}`}>{organizer.mobilePhoneNumber}</a>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted py-4">
                    <p>Organizer information not available</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {/* Venue & Location full width */}
        <Row>
          <Col>
            <Card className="event-detail-venue-card mb-4">
              <Card.Header className="bg-primary text-white">
                <h4 className="mb-0"><FaMapMarkerAlt className="me-2" /> Venue & Location</h4>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={5} lg={5} className="event-detail-venue-details-col">
                    {localityId ? (
                      <h5 
                        className="venue-name clickable-venue"
                        onClick={handleLocalityClick}
                        title="Click to view venue details"
                      >
                        {venue}
                      </h5>
                    ) : (
                      <h5 className="venue-name">{venue}</h5>
                    )}
                    <p className="venue-address">
                      <FaMapMarkerAlt className="me-2 text-muted" /> 
                      {address}
                    </p>
                    
                    <div className="event-detail-venue-info-grid">
                      <div className="event-detail-venue-info-item">
                        <span className="event-detail-venue-info-label">
                          <FaDoorOpen className="text-primary me-2" />
                          <span>Room</span>
                        </span>
                        <span className="event-detail-venue-info-value">{room}</span>
                      </div>
                      
                      {location && location.city && (
                        <div className="event-detail-venue-info-item">
                          <span className="event-detail-venue-info-label">
                            <FaGlobe className="text-primary me-2" />
                            <span>City</span>
                          </span>
                          <span className="event-detail-venue-info-value">{location.city.name}, {location.city.country}</span>
                        </div>
                      )}
                      
                      {spaceRenter && (
                        <div className="event-detail-venue-info-item">
                          <span className="event-detail-venue-info-label">
                            <FaBuilding className="text-primary me-2" />
                            <span>Managed by</span>
                          </span>
                          <span className="event-detail-venue-info-value">{spaceRenter.firstName} {spaceRenter.lastName}</span>
                        </div>
                      )}
                    </div>
                  </Col>
                  <Col md={7} lg={7} className="event-detail-venue-map-col">
                    <div className="event-detail-venue-map">
                      <iframe
                        title="Event Location"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                        frameBorder="0"
                        scrolling="no"
                        marginHeight="0"
                        marginWidth="0"
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                      ></iframe>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default EventDetailPage;