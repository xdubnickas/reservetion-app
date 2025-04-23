import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, ListGroup } from 'react-bootstrap';
import { 
  FaMapMarkerAlt, 
  FaChevronLeft, 
  FaBuilding, 
  FaPhone, 
  FaEnvelope, 
  FaRegCalendarAlt,
  FaInfoCircle,
  FaClock,
  FaUsers,
  FaDoorOpen
} from 'react-icons/fa';
import axios from 'axios';
import moment from 'moment';
import '../styles/LocalityDetailPage.css';

const LocalityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [locality, setLocality] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocalityDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch locality details
        const localityResponse = await axios.get(`http://localhost:8080/api/localities/${id}`);
        setLocality(localityResponse.data);
        
        // Fetch events for this locality with active status filter
        const eventsResponse = await axios.get(`http://localhost:8080/api/localities/${id}/events`);
        setEvents(eventsResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching locality details:', err);
        setError('Failed to load locality details');
        setLoading(false);
      }
    };

    fetchLocalityDetails();
  }, [id]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  // Add status based class and indicator for event cards
  const getEventCardClass = (status) => {
    let baseClass = 'locality-event-card';
    if (status === 'INACTIVE') return `${baseClass} inactive-event`;
    if (status === 'FULL') return `${baseClass} full-event`;
    return baseClass;
  };

  const getEventStatusBadge = (status) => {
    if (status === 'INACTIVE' || status === 'FULL') {
      return (
        <div className={`event-status-badge2 ${status.toLowerCase()}`}>
          {status}
        </div>
      );
    }
    return null;
  };

  if (loading) return (
    <Container className="my-5 text-center">
      <h3>Loading locality details...</h3>
    </Container>
  );

  if (error) return (
    <Container className="my-5 text-center">
      <h3>Error: {error}</h3>
      <Button variant="primary" onClick={handleGoBack}>Go Back</Button>
    </Container>
  );

  if (!locality) return (
    <Container className="my-5 text-center">
      <h3>Locality not found</h3>
      <Button variant="primary" onClick={handleGoBack}>Go Back</Button>
    </Container>
  );

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.eventDate) - new Date(b.eventDate)
  );

  return (
    <Container className="my-4 locality-detail-container">
      <div className="locality-detail-header mb-4">
        <Button 
          variant="outline-primary" 
          className="locality-detail-back-button d-flex align-items-center"
          onClick={handleGoBack}
        >
          <FaChevronLeft className="me-2" /> Go Back
        </Button>
      </div>
      
      <Row className="mb-4">
        <Col lg={7}>
          <Card className="locality-detail-card">
            <Card.Header className="bg-primary text-white locality-card-header">
              <h3 className="mb-0"><FaBuilding className="me-2" /> {locality.name}</h3>
            </Card.Header>
            <Card.Body className="locality-card-body">
              <Row>
                <Col md={6}>
                  <div className="locality-info-section">
                    <div className="info-block">
                      <h5 className="section-title"><FaInfoCircle className="me-2 text-primary" /> About This Venue</h5>
                      <div className="locality-description">
                        {locality.description || "No description available for this venue."}
                      </div>
                    </div>
                    
                    <div className="info-block address-block">
                      <h5 className="section-title"><FaMapMarkerAlt className="me-2 text-primary" /> Address</h5>
                      <div className="locality-address">
                        <strong>{locality.address}</strong>
                        <div className="city-country">{locality.city.name}, {locality.city.country}</div>
                      </div>
                    </div>
                    
                    {locality.spaceRenter && (
                      <div className="info-block manager-block">
                        <h5 className="section-title"><FaUsers className="me-2 text-primary" /> Managed By</h5>
                        <div className="manager-details">
                          <div className="manager-name">
                            <strong>{locality.spaceRenter.firstName} {locality.spaceRenter.lastName}</strong>
                          </div>
                          <div className="manager-contact">
                            <a href={`mailto:${locality.spaceRenter.email}`} className="contact-link">
                              <FaEnvelope className="me-1 text-muted" /> {locality.spaceRenter.email}
                            </a>
                            {locality.spaceRenter.mobilePhoneNumber && (
                              <span className="d-block phone-number">
                                <FaPhone className="me-1 text-muted" /> {locality.spaceRenter.mobilePhoneNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Col>
                <Col md={6}>
                  {/* Room list if available */}
                  {locality.rooms && locality.rooms.length > 0 && (
                    <div className="locality-rooms-section">
                      <h5 className="section-title mb-3"><FaDoorOpen className="me-2 text-primary" /> Available Rooms</h5>
                      <div className="rooms-list-container">
                        <ListGroup>
                          {locality.rooms.map(room => (
                            <ListGroup.Item key={room.id} className="room-item">
                              <div className="room-details">
                                <div className="room-name">{room.name}</div>
                                <div className="room-capacity">
                                  <FaUsers className="me-1 text-muted small" /> 
                                  <span className="text-muted small">Capacity: {room.capacity} people</span>
                                </div>
                              </div>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </div>
                      <div className="total-capacity mt-3">
                        <div className="capacity-label">Total Venue Capacity:</div>
                        <div className="capacity-value">{locality.totalCapacity} people</div>
                      </div>
                    </div>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={5}>
          <Card className="locality-map-card h-100">
            <Card.Header className="bg-secondary text-white">
              <h4 className="mb-0"><FaMapMarkerAlt className="me-2" /> Location</h4>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="locality-map-container">
                <iframe
                  title="Locality Location"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    `${locality.address}, ${locality.city.name}, ${locality.city.country}`
                  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                ></iframe>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Card className="locality-events-card mb-4">
        <Card.Header className="bg-success text-white">
          <h4 className="mb-0"><FaRegCalendarAlt className="me-2" /> Upcoming Events at {locality.name}</h4>
        </Card.Header>
        <Card.Body>
          {sortedEvents.length > 0 ? (
            <div className="locality-events-grid">
              {sortedEvents.map(event => (
                <Card 
                  key={event.id} 
                  className={getEventCardClass(event.status)}
                  onClick={() => handleEventClick(event.id)}
                >
                  <div className="locality-event-date-badge">
                    <div className="month">{moment(event.eventDate).format('MMM')}</div>
                    <div className="day">{moment(event.eventDate).format('DD')}</div>
                  </div>
                  
                  <Card.Body>
                    <Card.Title className="locality-event-title">{event.name}</Card.Title>
                    <div className="locality-event-info">
                      <div className="locality-event-time">
                        <FaClock className="me-1 text-muted" /> 
                        {moment(event.startTime, 'HH:mm').format('HH:mm')}
                      </div>
                      <div className="locality-event-category">
                        {event.category}
                      </div>
                    </div>
                    <div className="locality-event-price">
                      {event.price} €
                    </div>
                    {getEventStatusBadge(event.status)}
                  </Card.Body>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted py-4">
              <p>No upcoming events at this venue.</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LocalityDetailPage;
