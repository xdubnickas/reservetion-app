import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, Button, Form, InputGroup, Badge } from 'react-bootstrap';
import { BsSearch, BsGeoAlt, BsBuilding, BsPeople, BsDoorOpen, BsArrowRight } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { localityService } from '../services/localityService';
import '../styles/LocalitiesPage.css';

const LocalitiesPage = () => {
  const [localities, setLocalities] = useState([]);
  const [filteredLocalities, setFilteredLocalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [totalLocalities, setTotalLocalities] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const locData = await localityService.getAllLocalities();
        const cityData = await localityService.getAllCities();
        
        setLocalities(locData);
        setFilteredLocalities(locData);
        setTotalLocalities(locData.length);
        setCities(cityData);
      } catch (error) {
        console.error('Error fetching localities:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = localities;
    
    // Apply city filter
    if (selectedCity) {
      filtered = filtered.filter(locality => 
        locality.city.name === selectedCity
      );
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(locality => 
        locality.name.toLowerCase().includes(term) || 
        locality.address.toLowerCase().includes(term)
      );
    }
    
    setFilteredLocalities(filtered);
  }, [searchTerm, selectedCity, localities]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCity('');
  };

  const navigateToLocalityDetail = (id) => {
    navigate(`/localities/${id}`);
  };

  if (loading) {
    return (
      <div className="localities-loading">
        <div className="spinner-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading venues...</p>
        </div>
      </div>
    );
  }

  return (
    <Container className="localities-page py-4">
      <div className="localities-header">
        <h1>Explore Amazing Venues</h1>
        <p className="text-muted">Discover the perfect space for your next event</p>
      </div>
      
      <div className="filter-section mb-4">
        <div className="filter-header">
          <h4>Find Your Ideal Venue</h4>
          <span className="result-count">{filteredLocalities.length} {filteredLocalities.length === 1 ? 'venue' : 'venues'} found</span>
        </div>
        <Row className="g-3">
          <Col lg={6}>
            <InputGroup className="search-input">
              <InputGroup.Text>
                <BsSearch />
              </InputGroup.Text>
              <Form.Control 
                placeholder="Search by name or address..." 
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </InputGroup>
          </Col>
          <Col lg={4}>
            <Form.Select 
              value={selectedCity}
              onChange={handleCityChange}
              className="city-select"
            >
              <option value="">All Cities</option>
              {cities.map((city, index) => (
                <option key={index} value={city}>{city}</option>
              ))}
            </Form.Select>
          </Col>
          <Col lg={2}>
            <Button 
              variant="outline-secondary" 
              onClick={resetFilters}
              className="w-100 reset-btn"
              disabled={!searchTerm && !selectedCity}
            >
              Reset Filters
            </Button>
          </Col>
        </Row>
      </div>
      
      {filteredLocalities.length === 0 ? (
        <div className="no-results">
          <div className="no-results-content">
            <BsSearch size={40} className="mb-3" />
            <h3>No venues found</h3>
            <p>Try adjusting your search criteria or explore other cities</p>
            <Button variant="primary" onClick={resetFilters}>Reset Filters</Button>
          </div>
        </div>
      ) : (
        <Row className="localities-grid">
          {filteredLocalities.map(locality => (
            <Col key={locality.id} md={6} lg={4} className="mb-4">
              <Card 
                className="locality-card" 
                onClick={() => navigateToLocalityDetail(locality.id)}
              >
                <div className="locality-card-header">
                  <h3>{locality.name}</h3>
                  <Badge bg="info" className="city-badge">
                    {locality.city.name}
                  </Badge>
                </div>
                <Card.Body>
                  <div className="locality-details">
                    <div className="detail-item">
                      <BsGeoAlt className="detail-icon" />
                      <span className="detail-text">{locality.address}</span>
                    </div>
                    <div className="detail-item">
                      <BsBuilding className="detail-icon" />
                      <span className="detail-text">{locality.city.country}</span>
                    </div>
                    <div className="detail-item">
                      <BsPeople className="detail-icon" />
                      <span className="detail-text">Total Capacity: <strong>{locality.totalCapacity}</strong> people</span>
                    </div>
                    <div className="detail-item">
                      <BsDoorOpen className="detail-icon" />
                      <span className="detail-text">
                        {locality.rooms?.length || 0} {locality.rooms?.length === 1 ? 'room' : 'rooms'} available
                      </span>
                    </div>
                  </div>
                  
                  {locality.rooms && locality.rooms.length > 0 && (
                    <div className="rooms-preview">
                      <h6>Featured Rooms:</h6>
                      <ul className="rooms-list">
                        {locality.rooms.slice(0, 2).map(room => (
                          <li key={room.id} className="room-item">
                            <span className="room-name">{room.name}</span>
                            <span className="room-capacity">
                              <BsPeople size={14} className="me-1" />
                              {room.capacity}
                            </span>
                          </li>
                        ))}
                        {locality.rooms.length > 2 && (
                          <li className="room-item more-rooms">
                            +{locality.rooms.length - 2} more rooms
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </Card.Body>
                <div className="card-footer">
                  <Button 
                    variant="primary" 
                    className="view-details-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToLocalityDetail(locality.id);
                    }}
                  >
                    View Details <BsArrowRight className="ms-2" />
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default LocalitiesPage;
