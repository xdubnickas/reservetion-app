import { useState, useRef, useEffect } from 'react';
import { Form, ListGroup } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { cityService } from '../../services/cityService';
import '../../styles/CitySelector.css';

const CitySelector = ({ value, onChange, required = false, placeholder = "Start typing for city suggestions...", disabled = false }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputTimeout = useRef(null);
  const inputRef = useRef(null);

  // Clean up timeout when component unmounts
  useEffect(() => {
    return () => {
      if (inputTimeout.current) {
        clearTimeout(inputTimeout.current);
      }
    };
  }, []);

  const handleInputChange = (inputValue) => {
    onChange(inputValue);
    
    // Don't search if disabled
    if (disabled) return;
    
    // Clear any existing timeout
    if (inputTimeout.current) {
      clearTimeout(inputTimeout.current);
    }
    
    // Don't search if input is less than 2 characters
    if (inputValue.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    // Set loading state
    setIsLoading(true);
    
    // Debounce API calls to avoid making too many requests
    inputTimeout.current = setTimeout(async () => {
      try {
        const result = await cityService.searchCities(inputValue);
        if (result && result.data) {
          setSuggestions(result.data);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Failed to fetch city suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 500); // 500ms delay before making the API call
  };

  const handleCitySelect = (city) => {
    // Format the city name with full country name instead of country code
    const countryName = getCountryName(city.countryCode) || city.countryCode;
    onChange(`${city.name}, ${countryName}`);
    setShowSuggestions(false);
  };

  // Helper function to map country codes to full country names
  const getCountryName = (code) => {
    const countryMap = {
      'SK': 'Slovakia',
      'CZ': 'Czech Republic',
      'DE': 'Germany',
      'AT': 'Austria',
      'HU': 'Hungary',
      'PL': 'Poland',
      // Add more mappings as needed
    };
    return countryMap[code] || code;
  };

  const handleFocus = () => {
    if (!disabled && value.length >= 2) {
      handleInputChange(value);
    }
  };

  return (
    <div className="city-selector position-relative">
      <Form.Control
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        disabled={disabled}
      />
      
      {isLoading && !disabled && (
        <div className="city-loader position-absolute">
          <div className="spinner-border spinner-border-sm text-secondary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      
      {!disabled && showSuggestions && suggestions.length > 0 && (
        <ListGroup className="city-suggestions position-absolute w-100">
          {suggestions.map((city, index) => (
            <ListGroup.Item 
              key={index} 
              action 
              onClick={() => handleCitySelect(city)}
              className="city-suggestion-item"
            >
              {city.name}, {getCountryName(city.countryCode)}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
      
      {!disabled && value.length >= 2 && showSuggestions && suggestions.length === 0 && !isLoading && (
        <div className="no-suggestions position-absolute w-100">
          No matching cities found
        </div>
      )}
    </div>
  );
};

CitySelector.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool
};

export default CitySelector;
