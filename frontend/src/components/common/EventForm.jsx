import { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { localityService } from '../../services/localityService';

const EventForm = ({ show, onHide, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    maxCapacity: '', // Changed from capacity
    price: '',
    eventDate: '',
    time: '',
    image: null,
    localityId: '',
  });
  
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [localities, setLocalities] = useState([]);
  const [filteredLocalities, setFilteredLocalities] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [localitiesData, citiesData] = await Promise.all([
          localityService.getAllLocalities(),
          localityService.getAllCities()
        ]);
        setLocalities(localitiesData);
        setCities(citiesData);

        // If editing, set the selected city
        if (initialData?.locality) {
          const locality = localitiesData.find(l => l.id === initialData.locality.id);
          if (locality) {
            setSelectedCity(locality.city.name);
          }
        }
      } catch (error) {
        console.error('Failed to load localities:', error);
      }
    };
    
    loadData();
  }, [initialData]);

  useEffect(() => {
    if (selectedCity) {
      const filtered = localities.filter(locality => locality.city.name === selectedCity);
      setFilteredLocalities(filtered);
    } else {
      setFilteredLocalities([]);
    }
  }, [selectedCity, localities]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        category: initialData.category || '',
        maxCapacity: initialData.maxCapacity || '', // Changed from capacity
        price: initialData.price || '',
        eventDate: initialData.eventDate || '',
        time: initialData.time || '',
        localityId: initialData.locality?.id || '',
        image: null
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      maxCapacity: '',
      price: '',
      eventDate: '',
      time: '',
      image: null,
      localityId: '',
    });
    setSelectedCity('');
    onHide();
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      className="event-modal" 
      size="xl"
      centered
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>{initialData ? 'Edit Event' : 'Create New Event'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* Basic Info Column */}
            <div className="col-md-6">
              {/* Name and Description Fields */}
              {/* ...existing form fields... */}
            </div>

            {/* Details Column */}
            <div className="col-md-6">
              {/* Category, Price, Date, Time, maxCapacity, Image Fields */}
              {/* ...existing form fields... */}
            </div>
          </div>

          {/* Location Section */}
          <div className="locality-section">
            <h5 className="mb-4">Event Location</h5>
            <div className="locality-container">
              <div className="locality-selects">
                <Form.Group>
                  <Form.Label>Select City</Form.Label>
                  <Form.Select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    required
                  >
                    <option value="">Select city first</option>
                    {cities.map(city => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {selectedCity && (
                  <Form.Group>
                    <Form.Label>Select Venue in {selectedCity}</Form.Label>
                    <Form.Select
                      value={formData.localityId}
                      onChange={(e) => setFormData({...formData, localityId: e.target.value})}
                      required
                    >
                      <option value="">Select venue</option>
                      {filteredLocalities.map(locality => (
                        <option key={locality.id} value={locality.id}>
                          {locality.name} - {locality.address}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                )}
              </div>

              <div className="locality-field">
                {/* Venue Details Display */}
                {/* ...existing venue details... */}
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" className="me-2" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

EventForm.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    category: PropTypes.string,
    maxCapacity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    eventDate: PropTypes.string,
    time: PropTypes.string,
    locality: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      city: PropTypes.string
    })
  })
};

export default EventForm;
