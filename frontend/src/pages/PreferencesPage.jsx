import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, InputGroup, Alert } from 'react-bootstrap';
import CitySelector from '../components/common/CitySelector';
import Slider from 'rc-slider';
import { getToken } from '../services/authService';
import { getUserPreferences, saveUserPreferences } from '../services/preferencesService';
import { eventCategories } from '../utils/categoryData';
import 'rc-slider/assets/index.css';
import '../styles/PreferencesPage.css';

const PreferencesPage = () => {
  // State for user preferences
  const [city, setCity] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [category, setCategory] = useState('');
  
  // State for which preferences the user wants to save - default to TRUE now
  const [saveLocation, setSaveLocation] = useState(true);
  const [savePriceRange, setSavePriceRange] = useState(true);
  const [saveCategory, setSaveCategory] = useState(true);
  
  // State for alerts/feedback
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn] = useState(!!getToken());
  
  // Load preferences from API or localStorage on component mount
  useEffect(() => {
    const loadPreferences = async () => {
      setIsLoading(true);
      
      try {
        let preferences;
        
        // If user is logged in, try to get preferences from API
        if (isLoggedIn) {
          preferences = await getUserPreferences();
        }
        
        // If API call failed or user isn't logged in, try localStorage
        if (!preferences) {
          const savedPreferencesJSON = localStorage.getItem('userPreferences');
          if (savedPreferencesJSON) {
            preferences = JSON.parse(savedPreferencesJSON);
          }
        }
        
        // Update state with loaded preferences
        if (preferences) {
          if (preferences.city) {
            setCity(preferences.city);
          } else {
            setSaveLocation(false);
          }
          
          if (preferences.priceRange) {
            setPriceRange(preferences.priceRange);
          } else {
            setSavePriceRange(false);
          }
          
          if (preferences.category) {
            setCategory(preferences.category);
          } else {
            setSaveCategory(false);
          }
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
        setErrorMessage('Failed to load your preferences. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPreferences();
  }, [isLoggedIn]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    // Build preferences object from state
    const updatedPreferences = {};
    if (saveLocation) updatedPreferences.city = city;
    if (savePriceRange) updatedPreferences.priceRange = priceRange;
    if (saveCategory) updatedPreferences.category = category;
    
    try {
      // If logged in, save to backend
      if (isLoggedIn) {
        await saveUserPreferences(updatedPreferences);
      }
      
      // Always save to localStorage as backup
      localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences));
      
      setSuccessMessage('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      setErrorMessage('Failed to save your preferences. Please try again later.');
      
      // Still try to save to localStorage if API fails
      localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle min price input change
  const handleMinPriceChange = (e) => {
    const newMinPrice = parseInt(e.target.value) || 0;
    if (newMinPrice >= 0 && newMinPrice <= priceRange[1]) {
      setPriceRange([newMinPrice, priceRange[1]]);
    }
  };
  
  // Handle max price input change
  const handleMaxPriceChange = (e) => {
    const newMaxPrice = parseInt(e.target.value) || 0;
    if (newMaxPrice >= priceRange[0] && newMaxPrice <= 1000) {
      setPriceRange([priceRange[0], newMaxPrice]);
    }
  };
  
  return (
    <Container className="preferences-container my-5">
      <h1 className="text-center mb-4">My Preferences</h1>
      
      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}
      
      {errorMessage && (
        <Alert variant="danger" dismissible onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}
      
      <Card className="preferences-card shadow">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-4">
              <Col md={12}>
                <div className={`preference-section ${saveLocation ? 'active' : 'inactive'}`}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Form.Label className="preference-label mb-0">Preferred Location</Form.Label>
                    <Form.Check 
                      type="switch"
                      id="location-switch"
                      label="Include in preferences"
                      checked={saveLocation}
                      onChange={() => setSaveLocation(!saveLocation)}
                      className="preference-switch"
                    />
                  </div>
                  <Form.Group className="city-selector-container">
                    {saveLocation ? (
                      <CitySelector
                        value={city}
                        onChange={setCity}
                        placeholder="Enter your preferred city or location"
                      />
                    ) : (
                      <Form.Control
                        type="text"
                        placeholder="Enter your preferred city or location"
                        disabled
                        value={city}
                      />
                    )}
                    <Form.Text className="text-muted">
                      We&apos;ll prioritize events near this location
                    </Form.Text>
                  </Form.Group>
                </div>
              </Col>
            </Row>
            
            <Row className="mb-4">
              <Col md={12}>
                <div className={`preference-section ${savePriceRange ? 'active' : 'inactive'}`}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Form.Label className="preference-label mb-0">Price Range</Form.Label>
                    <Form.Check 
                      type="switch"
                      id="price-switch"
                      label="Include in preferences"
                      checked={savePriceRange}
                      onChange={() => setSavePriceRange(!savePriceRange)}
                      className="preference-switch"
                    />
                  </div>
                  <Form.Group>
                    <div className="price-slider-container">
                      <Slider
                        range
                        min={0}
                        max={1000}
                        value={priceRange}
                        onChange={setPriceRange}
                        className="price-range-slider"
                        allowCross={false}
                        pushable={50}
                        step={10}
                        disabled={!savePriceRange}
                      />
                      <Row className="mt-4 align-items-center">
                        <Col xs={5} sm={5}>
                          <InputGroup className="price-input-group">
                            <InputGroup.Text>Min</InputGroup.Text>
                            <Form.Control
                              type="number"
                              min="0"
                              max={priceRange[1]}
                              value={priceRange[0]}
                              onChange={handleMinPriceChange}
                              className="price-input"
                              disabled={!savePriceRange}
                            />
                            <InputGroup.Text>€</InputGroup.Text>
                          </InputGroup>
                        </Col>
                        <Col xs={2} sm={2} className="text-center">
                          <span className="price-range-separator">to</span>
                        </Col>
                        <Col xs={5} sm={5}>
                          <InputGroup className="price-input-group">
                            <InputGroup.Text>Max</InputGroup.Text>
                            <Form.Control
                              type="number"
                              min={priceRange[0]}
                              max="1000"
                              value={priceRange[1]}
                              onChange={handleMaxPriceChange}
                              className="price-input"
                              disabled={!savePriceRange}
                            />
                            <InputGroup.Text>€</InputGroup.Text>
                          </InputGroup>
                        </Col>
                      </Row>
                    </div>
                    <Form.Text className="text-muted">
                      We&apos;ll show events within this price range
                    </Form.Text>
                  </Form.Group>
                </div>
              </Col>
            </Row>
            
            <Row className="mb-4">
              <Col md={12}>
                <div className={`preference-section ${saveCategory ? 'active' : 'inactive'}`}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Form.Label className="preference-label mb-0">Preferred Category</Form.Label>
                    <Form.Check 
                      type="switch"
                      id="category-switch"
                      label="Include in preferences"
                      checked={saveCategory}
                      onChange={() => setSaveCategory(!saveCategory)}
                      className="preference-switch"
                    />
                  </div>
                  <Form.Group>
                    <Form.Select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="category-select"
                      disabled={!saveCategory}
                    >
                      <option value="">All Categories</option>
                      {eventCategories.map((cat, index) => (
                        <option key={index} value={cat.toLowerCase()}>
                          {cat}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Text className="text-muted">
                      We&apos;ll prioritize events in your preferred category
                    </Form.Text>
                  </Form.Group>
                </div>
              </Col>
            </Row>
            
            <div className="text-center mt-4">
              <Button 
                type="submit" 
                className="save-preferences-btn"
                size="lg"
                disabled={(!saveLocation && !savePriceRange && !saveCategory) || isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Preferences'}
              </Button>
              
              {!saveLocation && !savePriceRange && !saveCategory && (
                <div className="mt-2 text-muted">
                  <small>Enable at least one preference to save</small>
                </div>
              )}
              
              {!isLoggedIn && (
                <div className="mt-3 text-center">
                  <small className="text-muted">
                    You&apos;re not logged in. Preferences will be saved locally.
                    <br />
                    Log in to sync your preferences across devices.
                  </small>
                </div>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PreferencesPage;
