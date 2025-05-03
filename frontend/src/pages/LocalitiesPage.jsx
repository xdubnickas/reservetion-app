import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, Button, Form, InputGroup, Badge } from 'react-bootstrap';
import { BsSearch, BsGeoAlt, BsBuilding, BsPeople, BsDoorOpen, BsArrowRight, BsFilter, BsPerson } from 'react-icons/bs';
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
  const [spaceRenters, setSpaceRenters] = useState([]);
  const [selectedSpaceRenter, setSelectedSpaceRenter] = useState('');
  const [totalLocalities, setTotalLocalities] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const locData = await localityService.getAllLocalities();
        const cityData = await localityService.getAllCities();
        const renterData = await localityService.getAllSpaceRenters();
        
        setLocalities(locData);
        setFilteredLocalities(locData);
        setTotalLocalities(locData.length);
        setCities(cityData);
        setSpaceRenters(renterData);
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
    
    // Apply space renter filter
    if (selectedSpaceRenter) {
      filtered = filtered.filter(locality => 
        locality.spaceRenter && locality.spaceRenter.id.toString() === selectedSpaceRenter
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
  }, [searchTerm, selectedCity, selectedSpaceRenter, localities]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
  };

  const handleSpaceRenterChange = (e) => {
    setSelectedSpaceRenter(e.target.value);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCity('');
    setSelectedSpaceRenter('');
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
      <Row className="justify-content-center mb-5">
        <Col lg={10}>
          <div className="text-center localities-header">
            <h1>Explore Amazing Venues</h1>
            <p className="lead">
              Discover the perfect space for your next event
            </p>
          </div>
        </Col>
      </Row>
      
      <Card className="filter-section mb-4">
        <Card.Body>
          <div className="filter-header">
            <h4><BsFilter className="me-2" />Find Your Ideal Venue</h4>
            <Badge bg="primary" className="result-badge">
              {filteredLocalities.length} {filteredLocalities.length === 1 ? 'venue' : 'venues'} found
            </Badge>
          </div>
          <Row className="g-3 mt-2">
            <Col lg={3}>
              <InputGroup>
                <InputGroup.Text>
                  <BsSearch />
                </InputGroup.Text>
                <Form.Control 
                  placeholder="Search by name or address..." 
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="search-field"
                />
              </InputGroup>
            </Col>
            <Col lg={3}>
              <InputGroup>
                <InputGroup.Text>
                  <BsBuilding />
                </InputGroup.Text>
                <Form.Select 
                  value={selectedCity}
                  onChange={handleCityChange}
                >
                  <option value="">All Cities</option>
                  {cities.map((city, index) => (
                    <option key={index} value={city}>{city}</option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>
            <Col lg={3}>
              <InputGroup>
                <InputGroup.Text>
                  <BsPerson />
                </InputGroup.Text>
                <Form.Select 
                  value={selectedSpaceRenter}
                  onChange={handleSpaceRenterChange}
                >
                  <option value="">All Space Renters</option>
                  {spaceRenters.map((renter) => (
                    <option key={renter.id} value={renter.id}>
                      {renter.firstName} {renter.lastName}
                    </option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>
            <Col lg={3}>
              <Button 
                variant="outline-secondary" 
                onClick={resetFilters}
                className="w-100 reset-btn"
                disabled={!searchTerm && !selectedCity && !selectedSpaceRenter}
              >
                Reset Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {filteredLocalities.length === 0 ? (
        <Card className="no-results text-center">
          <Card.Body className="py-5">
            <BsSearch size={40} className="mb-3 text-muted" />
            <h3>No venues found</h3>
            <p className="text-muted">Try adjusting your search criteria or explore other cities</p>
            <Button variant="primary" onClick={resetFilters}>Reset Filters</Button>
          </Card.Body>
        </Card>
      ) : (
        <Row className="localities-grid g-4">
          {filteredLocalities.map(locality => (
            <Col key={locality.id} md={6} lg={4}>
              <Card 
                className="locality-card h-100" 
                onClick={() => navigateToLocalityDetail(locality.id)}
              >
                <Card.Header className="locality-card-header">
                  <div className="d-flex justify-content-between align-items-center">
                    <h3 className="locality-name">{locality.name}</h3>
                    <Badge bg="primary" pill className="city-badge">
                      {locality.city.name}
                    </Badge>
                  </div>
                </Card.Header>
                
                <Card.Body className="locality-card-body">
                  <div className="locality-info-grid">
                    <div className="locality-info-item">
                      <BsGeoAlt className="locality-info-icon" />
                      <div>
                        <h5>Address</h5>
                        <p>{locality.address}</p>
                      </div>
                    </div>
                    
                    <div className="locality-info-item">
                      <BsBuilding className="locality-info-icon" />
                      <div>
                        <h5>Country</h5>
                        <p>{locality.city.country}</p>
                      </div>
                    </div>
                    
                    <div className="locality-info-item">
                      <BsPeople className="locality-info-icon" />
                      <div>
                        <h5>Total Capacity</h5>
                        <p><strong>{locality.totalCapacity}</strong> people</p>
                      </div>
                    </div>
                    
                    <div className="locality-info-item">
                      <BsDoorOpen className="locality-info-icon" />
                      <div>
                        <h5>Rooms Available</h5>
                        <p>
                          {locality.rooms?.length || 0} {locality.rooms?.length === 1 ? 'room' : 'rooms'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {locality.rooms && locality.rooms.length > 0 && (
                    <div className="rooms-preview">
                      <h5 className="rooms-title">Featured Rooms:</h5>
                      <ul className="rooms-list">
                        {locality.rooms.slice(0, 2).map(room => (
                          <li key={room.id} className="rooms-list-item">
                            <span className="room-name">{room.name}</span>
                            <span className="room-capacity-spacer"></span>
                            <Badge bg="light" text="dark" className="room-capacity">
                              <BsPeople className="me-1" /> {room.capacity}
                            </Badge>
                          </li>
                        ))}
                        {locality.rooms.length > 2 && (
                          <li className="rooms-list-item more-rooms">
                            +{locality.rooms.length - 2} more rooms
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </Card.Body>
                
                <Card.Footer className="locality-card-footer">
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
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default LocalitiesPage;
