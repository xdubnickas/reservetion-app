import { useEffect, useState } from 'react';
import { Card, Container, Row, Col, Carousel, Button, Spinner } from 'react-bootstrap';
import { FaMapMarkerAlt, FaRegClock, FaRegCalendarAlt, FaSearch } from 'react-icons/fa';
import moment from 'moment';
import './SuggestedEvents.css';
import { eventService } from '../../../services/eventService';
import ReserveButton from './ReserveButton';
import { useNavigate } from 'react-router-dom';

const SuggestedEvents = () => {
  const navigate = useNavigate();
  // Default coordinates for Bratislava, Slovakia
  const DEFAULT_LATITUDE = 48.148598;
  const DEFAULT_LONGITUDE = 17.107748;
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coordinates, setCoordinates] = useState({ longitude: null, latitude: null });
  const [geoLocationAttempted, setGeoLocationAttempted] = useState(false);
  const [usingDefaultCoordinates, setUsingDefaultCoordinates] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Added to trigger refresh

  // Listen for login and logout events
  useEffect(() => {
    const handleAuthEvent = () => {
      console.log("Auth event detected, refreshing suggested events");
      // Reset states to trigger a full refresh
      setEvents([]);
      setLoading(true);
      setGeoLocationAttempted(false);
      setCoordinates({ longitude: null, latitude: null });
      // Increment refreshTrigger to force location detection and fetch
      setRefreshTrigger(prev => prev + 1);
    };

    // Add event listeners
    window.addEventListener('userLoggedIn', handleAuthEvent);
    window.addEventListener('userLoggedOut', handleAuthEvent);

    return () => {
      // Clean up event listeners
      window.removeEventListener('userLoggedIn', handleAuthEvent);
      window.removeEventListener('userLoggedOut', handleAuthEvent);
    };
  }, []);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Successfully obtained user location:", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setUsingDefaultCoordinates(false);
          setGeoLocationAttempted(true);
        },
        (error) => {
          console.error("Error getting location:", error);
          console.log("Using default coordinates for Bratislava:", {
            latitude: DEFAULT_LATITUDE,
            longitude: DEFAULT_LONGITUDE
          });
          // Use Bratislava coordinates as default when user denies permission
          setCoordinates({
            latitude: DEFAULT_LATITUDE,
            longitude: DEFAULT_LONGITUDE
          });
          setUsingDefaultCoordinates(true);
          setGeoLocationAttempted(true);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      console.log("Using default coordinates for Bratislava:", {
        latitude: DEFAULT_LATITUDE,
        longitude: DEFAULT_LONGITUDE
      });
      // Use Bratislava coordinates as default when geolocation is not supported
      setCoordinates({
        latitude: DEFAULT_LATITUDE,
        longitude: DEFAULT_LONGITUDE
      });
      setUsingDefaultCoordinates(true);
      setGeoLocationAttempted(true);
    }
  }, [refreshTrigger]); // Added refreshTrigger as dependency

  // Fetch events when coordinates are available
  useEffect(() => {
    // Only fetch if we have coordinates AND geolocation has been attempted
    if (geoLocationAttempted && coordinates.latitude !== null && coordinates.longitude !== null) {
      console.log("Fetching events with coordinates:", coordinates, 
                  usingDefaultCoordinates ? "(using default coordinates)" : "(using actual location)");
      fetchEvents(coordinates.longitude, coordinates.latitude);
    }
  }, [coordinates, geoLocationAttempted]);

  const fetchEvents = async (longitude, latitude) => {
    try {
      setLoading(true);
      const data = await eventService.getSuggestedEvents(longitude, latitude);
      setEvents(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load events');
      setLoading(false);
      console.error('Error fetching events:', err);
    }
  };

  const chunkEvents = (events, chunkSize) => {
    const result = [];
    for (let i = 0; i < events.length; i += chunkSize) {
      result.push(events.slice(i, i + chunkSize));
    }
    return result;
  };

  const eventChunks = chunkEvents(events, 4);

  // Handle navigation to event detail page
  const navigateToEventDetail = (eventId, e) => {
    // Prevent navigation if the click was on the reserve button
    if (e.target.closest('.reserve-button-container')) {
      return;
    }
    navigate(`/event/${eventId}`);
  };

  if (loading) return (
    <Container className="d-flex justify-content-center align-items-center my-5">
      <Spinner animation="border" role="status" variant="primary">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </Container>
  );
  if (error) return <p>{error}</p>;

  // Add empty state handler
  if (events.length === 0) {
    return (
      <Container className="suggested-events-container mt-4">
        <h2 className="mb-4 text-center">Suggested Events</h2>
        {usingDefaultCoordinates && (
          <div className="alert alert-info text-center mb-3">
            <small>Using default location (Bratislava). Enable location services for personalized recommendations.</small>
          </div>
        )}
        <div className="empty-events-container text-center p-5">
          <div className="empty-events-icon mb-3">
            <FaSearch size={50} opacity={0.5} />
          </div>
          <h3>No events found nearby</h3>
          <p className="text-muted">We couldn't find any suggested events in your area at the moment.</p>
          <div className="mt-4">
            <Button variant="primary" onClick={() => navigate('/events')}>
              Browse All Events
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="suggested-events-container mt-4">
      <h2 className="mb-4 text-center">Suggested Events</h2>
      {usingDefaultCoordinates && (
        <div className="alert alert-info text-center mb-3">
          <small>Using default location (Bratislava). Enable location services for personalized recommendations.</small>
        </div>
      )}
      <Carousel>
        {eventChunks.map((chunk, index) => (
          <Carousel.Item key={index}>
            <Row className="suggested-events-row">
              {chunk.map((event, eventIndex) => (
                <Col key={eventIndex} xs={12} sm={12} md={6} lg={3} className="mb-4 responsive-col">
                  <Card 
                    className="suggested-event-card cursor-pointer"
                    onClick={(e) => navigateToEventDetail(event.id, e)}
                  >
                    <Card.Img
                      variant="top"
                      src={event.imagePath ? `http://localhost:8080/${event.imagePath}` : 'https://placehold.co/150x150'}
                      alt={event.name}
                      className="event-image"
                    />

                    <Card.Body className="balanced-card-body">
                      <Card.Title className="event-title">{event.name}</Card.Title>
                      
                      <div className="event-info-row">
                        <div className="info-group">
                          <div className="info-item">
                            <FaRegCalendarAlt className="info-icon" /> 
                            <span>{moment(event.eventDate, 'YYYY-MM-DD').format('DD MMM')}</span>
                          </div>
                          <div className="info-item">
                            <FaRegClock className="info-icon" /> 
                            <span>{moment(event.startTime, 'HH:mm').format('HH:mm')}</span>
                          </div>
                        </div>
                        <div className="info-group date-price-group">
                          <div className="info-item location-item">
                            <span>{event.rooms[0].locality.city.name}</span>
                            <FaMapMarkerAlt className="info-icon" /> 
                          </div>
                          <div className="info-item price-item">
                            <span className="price-label">Price:</span>
                            <span>{event.price} €</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="d-flex justify-content-center reserve-button-container">
                        <ReserveButton event={event} />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Carousel.Item>
        ))}
      </Carousel>
    </Container>
  );
};

export default SuggestedEvents;
