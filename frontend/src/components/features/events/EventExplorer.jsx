import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, InputGroup, Card, Button, Badge } from 'react-bootstrap';
import { FaSearch, FaFilter, FaSortAmountDown, FaMapMarkerAlt, FaRegCalendarAlt, FaCalendarDay, FaTag, FaGlobeAmericas } from 'react-icons/fa';
import { eventService } from '../../../services/eventService';
import { eventCategories } from '../../../utils/categoryData';
import moment from 'moment';
import './EventExplorer.css';
import EventImagePlaceholder from '../../common/EventImagePlaceholder';
import { hasValidImage } from '../../../utils/imageUtils';
import ReserveButton from './ReserveButton';
import { useNavigate, useLocation } from 'react-router-dom';

const EventExplorer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortOption, setSortOption] = useState('nameAsc');
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [viewType, setViewType] = useState('list'); // 'list' or 'grid'
  const [searchQuery, setSearchQuery] = useState('');

  // Parse URL query parameters on component mount
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const categoryParam = queryParams.get('category');
    
    if (categoryParam && eventCategories.includes(categoryParam)) {
      setSelectedCategories([categoryParam]);
    }
  }, [location.search]);

  // Handle category selection
  const handleCategoryChange = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(cat => cat !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Clear all selected categories
  const clearCategories = () => {
    setSelectedCategories([]);
  };

  // Fetch events data
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventData = await eventService.getUpcomingEvents();
        setEvents(eventData);
        setFilteredEvents(eventData);
        
        // Extract unique cities and countries
        const uniqueCities = [...new Set(eventData.map(event => event.rooms[0].locality.city.name))];
        const uniqueCountries = [...new Set(eventData.map(event => event.rooms[0].locality.city.country))];
        
        setCities(uniqueCities);
        setCountries(uniqueCountries);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...events];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(event => 
        event.name.toLowerCase().includes(query) || 
        event.description.toLowerCase().includes(query) ||
        event.rooms[0].locality.city.name.toLowerCase().includes(query)
      );
    }
    
    // Price range filter
    result = result.filter(event => 
      event.price >= priceRange.min && event.price <= priceRange.max
    );
    
    // Date range filter
    if (dateRange.from) {
      result = result.filter(event => 
        moment(event.eventDate).isSameOrAfter(moment(dateRange.from))
      );
    }
    
    if (dateRange.to) {
      result = result.filter(event => 
        moment(event.eventDate).isSameOrBefore(moment(dateRange.to))
      );
    }
    
    // Country filter
    if (selectedCountry) {
      result = result.filter(event => 
        event.rooms[0].locality.city.country === selectedCountry
      );
    }
    
    // City filter
    if (selectedCity) {
      result = result.filter(event => 
        event.rooms[0].locality.city.name === selectedCity
      );
    }
    
    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter(event => 
        selectedCategories.includes(event.category)
      );
    }
    
    // Apply sorting
    switch(sortOption) {
      case 'dateAsc':
        result.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
        break;
      case 'dateDesc':
        result.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
        break;
      case 'priceAsc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'nameAsc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nameDesc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'popularityDesc':
        result.sort((a, b) => {
          const countA = a.reservations ? a.reservations.length : 0;
          const countB = b.reservations ? b.reservations.length : 0;
          return countB - countA;
        });
        break;
      default:
        break;
    }
    
    setFilteredEvents(result);
  }, [events, searchQuery, priceRange, dateRange, selectedCity, selectedCountry, sortOption, selectedCategories]);
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setPriceRange({ min: 0, max: 1000 });
    setDateRange({ from: '', to: '' });
    setSelectedCity('');
    setSelectedCountry('');
    setSelectedCategories([]);
    setSortOption('dateAsc');
    
    // Clear URL query parameters
    navigate('/events', { replace: true });
  };

  // Handle navigation to event detail page
  const navigateToEventDetail = (eventId, e) => {
    // Prevent navigation if the click was on the reserve button or its container
    if (e.target.closest('.reserve-button-container')) {
      return;
    }
    navigate(`/event/${eventId}`);
  };
  
  if (loading) return <Container className="my-4 text-center"><h3>Loading events...</h3></Container>;

  return (
    <Container fluid="xl" className="event-explorer-container my-5">
      <h2 className="text-center mb-4">Explore Events</h2>
      
      {/* Search and Filters Section */}
      <div className="filters-section mb-4">
        <Row className="mb-3">
          <Col md={8}>
            <InputGroup>
              <InputGroup.Text><FaSearch /></InputGroup.Text>
              <Form.Control
                placeholder="Search events..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </InputGroup>
          </Col>
          <Col md={4} className="d-flex">
            <Button 
              variant="outline-secondary" 
              className="me-2"
              onClick={() => setViewType(viewType === 'grid' ? 'list' : 'grid')}
            >
              {viewType === 'list' ? 'Grid View' : 'List View'}
            </Button>
            <Button variant="outline-danger" onClick={resetFilters}>Reset Filters</Button>
          </Col>
        </Row>
        
        <Row className="filter-controls">
          <Col md={3} className="mb-3">
            <Form.Group>
              <Form.Label><FaFilter /> Price Range</Form.Label>
              <div className="d-flex">
                <Form.Control
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                  className="me-2"
                />
                <Form.Control
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                />
              </div>
            </Form.Group>
          </Col>
          
          <Col md={3} className="mb-3">
            <Form.Group>
              <Form.Label><FaRegCalendarAlt /> From Date</Form.Label>
              <Form.Control
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
              />
            </Form.Group>
          </Col>
          
          <Col md={3} className="mb-3">
            <Form.Group>
              <Form.Label><FaRegCalendarAlt /> To Date</Form.Label>
              <Form.Control
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
              />
            </Form.Group>
          </Col>
          
          <Col md={3} className="mb-3">
            <Form.Group>
              <Form.Label><FaGlobeAmericas /> Country</Form.Label>
              <Form.Select 
                value={selectedCountry} 
                onChange={(e) => setSelectedCountry(e.target.value)}
              >
                <option value="">All Countries</option>
                {countries.map((country, index) => (
                  <option key={index} value={country}>{country}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          
          <Col md={3} className="mb-3">
            <Form.Group>
              <Form.Label><FaMapMarkerAlt /> City</Form.Label>
              <Form.Select 
                value={selectedCity} 
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="">All Cities</option>
                {cities.map((city, index) => (
                  <option key={index} value={city}>{city}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          
          <Col md={3} className="mb-3">
            <Form.Group>
              <Form.Label><FaSortAmountDown /> Sort By</Form.Label>
              <Form.Select 
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="popularityDesc">Most Popular</option>
                <option value="dateAsc">Date (Nearest first)</option>
                <option value="dateDesc">Date (Latest first)</option>
                <option value="priceAsc">Price (Low to High)</option>
                <option value="priceDesc">Price (High to Low)</option>
                <option value="nameAsc">Name (A-Z)</option>
                <option value="nameDesc">Name (Z-A)</option>
              </Form.Select>
            </Form.Group>
          </Col>
          
          {/* Category Filter */}
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label><FaTag /> Categories</Form.Label>
              <div className="category-filter-container">
                <div className="category-filter-buttons">
                  {eventCategories.map((category, index) => (
                    <Button
                      key={index}
                      variant={selectedCategories.includes(category) ? "primary" : "outline-secondary"}
                      onClick={() => handleCategoryChange(category)}
                      className="category-filter-btn me-1"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
                {selectedCategories.length > 0 && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={clearCategories}
                    className="clear-categories-btn"
                  >
                    Clear all categories
                  </Button>
                )}
              </div>
            </Form.Group>
          </Col>
        </Row>
      </div>
      
      {/* Results Counter */}
      <div className="results-counter mb-3">
        <p className="text-secondary">
          Showing {filteredEvents.length} of {events.length} events
          {selectedCategories.length > 0 && (
            <span className="ms-2">
              (Filtered by {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'})
            </span>
          )}
        </p>
      </div>
      
      {/* Events Display Section */}
      {filteredEvents.length === 0 ? (
        <div className="text-center my-5">
          <h4>No events match your search criteria</h4>
          <Button variant="primary" onClick={resetFilters}>Clear filters</Button>
        </div>
      ) : viewType === 'list' ? (
        // List view - single column, except 2 columns on xxl screens
        <Row className="events-list-container">
          {filteredEvents.map((event) => {
            const category = event.category || 'Event'; // Use event.category with fallback
            
            return (
              <Col key={event.id} xs={12} xxl={6} className="mb-4">
                <Card 
                  className="event-card-horizontal cursor-pointer"
                  onClick={(e) => navigateToEventDetail(event.id, e)}
                >
                  <Row className="g-0">
                    <Col md={4} className="event-image-col position-relative">
                      {/* Image and badges */}
                      {hasValidImage(event.imagePath) ? (
                        <Card.Img 
                          src={`http://localhost:8080/${event.imagePath}`}
                          alt={event.name}
                          className="horizontal-event-image"
                        />
                      ) : (
                        <div className="horizontal-event-image-container">
                          <EventImagePlaceholder 
                            name={event.name}
                            className="horizontal-event-image"
                          />
                        </div>
                      )}
                      <Badge bg="primary" className="position-absolute top-0 start-0 m-2 category-badge">
                        <FaTag className="me-1" /> {category}
                      </Badge>
                      <div className="position-absolute bottom-0 end-0 m-2">
                        <Badge bg="info" className="price-tag fs-6 px-2 py-1">
                          {event.price} €
                        </Badge>
                      </div>
                    </Col>
                    <Col md={8} className="d-flex flex-column">
                      <Card.Body className="d-flex flex-column">
                        <Card.Title className="mb-3 event-title">
                          {event.name}
                        </Card.Title>
                        
                        <div className="event-details-horizontal mb-3 border-top border-bottom py-2">
                          <div className="row g-2 w-100">
                            <div className="col-12 col-sm-6 detail-item">
                              <div className="d-flex align-items-center">
                                <div className="event-icon-container">
                                  <FaRegCalendarAlt className="icon text-primary" />
                                </div>
                                <div className="ms-2 event-detail-text">
                                  <div>{moment(event.eventDate, 'YYYY-MM-DD').format('D MMM')} at {moment(event.startTime, 'HH:mm').format('HH:mm')}</div>
                                </div>
                              </div>
                            </div>
                            <div className="col-12 col-sm-6 detail-item">
                              <div className="d-flex align-items-center">
                                <div className="event-icon-container">
                                  <FaMapMarkerAlt className="icon text-primary" />
                                </div>
                                <div className="ms-2 event-detail-text">
                                  {event.rooms[0].locality.city.name}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Card.Text className="event-description-extended flex-grow-1">
                          {event.description}
                        </Card.Text>
                        
                        <div className="d-flex justify-content-end mt-auto reserve-button-container">
                          <ReserveButton event={event} size="lg" />
                        </div>
                      </Card.Body>
                    </Col>
                  </Row>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        // Grid view - responsive columns based on screen size
        <Row className="events-grid-container">
          {filteredEvents.map((event) => {
            const category = event.category || 'Event'; // Use event.category with fallback
            
            return (
              <Col key={event.id} xs={12} sm={6} md={6} lg={4} xl={3} className="mb-4">
                <Card 
                  className="grid-event-card h-100 cursor-pointer"
                  onClick={(e) => navigateToEventDetail(event.id, e)}
                >
                  <div className="position-relative">
                    {/* Image and badges */}
                    {hasValidImage(event.imagePath) ? (
                      <Card.Img 
                        variant="top"
                        src={`http://localhost:8080/${event.imagePath}`}
                        alt={event.name}
                        className="grid-event-image"
                      />
                    ) : (
                      <div className="grid-event-image">
                        <EventImagePlaceholder 
                          name={event.name} 
                          icon={<FaCalendarDay />}
                        />
                      </div>
                    )}
                    <Badge bg="primary" className="position-absolute top-0 start-0 m-2 category-badge">
                      <FaTag className="me-1" /> {category}
                    </Badge>
                    <div className="position-absolute bottom-0 end-0 m-2">
                      <Badge bg="info" className="price-tag fs-6 px-2 py-1">
                        {event.price} €
                      </Badge>
                    </div>
                  </div>
                  
                  <Card.Body className="d-flex flex-column pt-3">
                    <Card.Title className="text-center mb-3 event-title">
                      {event.name}
                    </Card.Title>
                    
                    <div className="grid-event-details mb-3 border-top border-bottom py-2">
                      <div className="date-time-container mb-2 text-center">
                        <div className="d-flex justify-content-center align-items-center">
                          <FaRegCalendarAlt className="icon text-primary" />
                          <span className="ms-2 event-date-time">
                            {moment(event.eventDate, 'YYYY-MM-DD').format('D MMM')} at {moment(event.startTime, 'HH:mm').format('HH:mm')}
                          </span>
                        </div>
                      </div>
                      <div className="location-container text-center">
                        <div className="d-flex justify-content-center align-items-center">
                          <FaMapMarkerAlt className="icon text-primary" />
                          <span className="ms-2">{event.rooms[0].locality.city.name}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Card.Text className="grid-event-description flex-grow-1">
                      {event.description && event.description.length > 80
                        ? `${event.description.substring(0, 80)}...`
                        : event.description}
                    </Card.Text>
                  </Card.Body>
                  
                  <Card.Footer className="text-center bg-white border-top-0 reserve-button-container">
                    <ReserveButton event={event} block={true} />
                  </Card.Footer>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
};

export default EventExplorer;
