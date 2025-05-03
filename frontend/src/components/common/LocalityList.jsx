import { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Collapse, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronDown, faCalendarCheck, faCalendarAlt, faBuilding, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { localityService } from '../../services/localityService';
import { roomService } from '../../services/roomService';
import RoomList from './RoomList';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import CitySelector from './CitySelector';
import '../../styles/LocalityList.css';

const LocalityList = () => {
  const [localities, setLocalities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentLocality, setCurrentLocality] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    totalCapacity: '',
    city: '',
  });
  const [localityRooms, setLocalityRooms] = useState({});
  const [openLocality, setOpenLocality] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [localityToDelete, setLocalityToDelete] = useState(null);
  const [eventCounts, setEventCounts] = useState({});

  useEffect(() => {
    loadLocalities();
  }, []);

  const loadLocalities = async () => {
    try {
      const data = await localityService.getMyLocalities();
      setLocalities(data);
      data.forEach(locality => {
        loadEventCounts(locality.id);
      });
    } catch (error) {
      console.error('Failed to load localities:', error);
    }
  };

  const loadEventCounts = async (localityId) => {
    try {
      const data = await localityService.getEventCountsByLocality(localityId);
      setEventCounts(prev => ({
        ...prev,
        [localityId]: data
      }));
    } catch (error) {
      console.error(`Failed to load event counts for locality ${localityId}:`, error);
      setEventCounts(prev => ({
        ...prev,
        [localityId]: { active: 0, total: 0 }
      }));
    }
  };

  const loadRoomsForLocality = async (localityId) => {
    try {
      const rooms = await roomService.getRoomsByLocality(localityId);
      setLocalityRooms(prev => ({
        ...prev,
        [localityId]: rooms
      }));
    } catch (error) {
      console.error('Failed to load rooms:', error);
    }
  };

  const reloadLocality = async (localityId) => {
    try {
      const data = await localityService.getLocality(localityId);
      setLocalities(localities.map(loc => 
        loc.id === localityId ? data : loc
      ));
    } catch (error) {
      console.error('Failed to reload locality:', error);
    }
  };

  const handleLocalityClick = (localityId) => {
    if (openLocality === localityId) {
      setOpenLocality(null);
    } else {
      setOpenLocality(localityId);
      loadRoomsForLocality(localityId);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // We still ensure capacity is at least 1 on submit as a safety measure
    const adjustedFormData = {
      ...formData,
      totalCapacity: Math.max(1, parseInt(formData.totalCapacity) || 1)
    };
    
    try {
      if (currentLocality) {
        await localityService.updateLocality(currentLocality.id, adjustedFormData);
      } else {
        await localityService.createLocality(adjustedFormData);
      }
      loadLocalities();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save locality:', error);
    }
  };

  const handleDelete = (id) => {
    setLocalityToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await localityService.deleteLocality(localityToDelete);
      loadLocalities();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete locality:', error);
    }
  };

  const handleCityChange = (cityWithCountry) => {
    setFormData({
      ...formData, 
      city: cityWithCountry,
    });
  };

  const resetFormData = () => {
    setFormData({
      name: '',
      address: '',
      totalCapacity: '',
      city: '',
    });
  };

  const handleEdit = (locality) => {
    setCurrentLocality(locality);
    setFormData({
      name: locality.name,
      address: locality.address,
      city: `${locality.city.name}, ${locality.city.country}`,
      totalCapacity: locality.totalCapacity,
    });
    setShowModal(true);
  };

  return (
    <div className="locality-list">
      <div className="d-flex justify-content-between mb-3">
        <h3>My Localities</h3>
        <Button 
          variant="primary" 
          className="create-event-btn create-locality-btn"
          onClick={() => {
            setCurrentLocality(null);
            resetFormData();
            setShowModal(true);
          }}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Add New Locality
        </Button>
      </div>

      <div className="row">
        {localities.map(locality => (
          <div key={locality.id} className="col-md-6 mb-3">
            <Card className="locality-card">
              <Card.Body>
                <Card.Title>
                  <FontAwesomeIcon icon={faBuilding} className="me-2" />
                  {locality.name}
                </Card.Title>
                <Card.Text>
                  <strong>Address:</strong> {locality.address}<br/>
                  <strong>City:</strong> {locality.city.name}, {locality.city.country}<br/>
                  <strong>Total Capacity:</strong> {locality.totalCapacity}
                </Card.Text>
                <div className="event-counts-section mb-3">
                  <Badge bg="info" className="me-2">
                    <FontAwesomeIcon icon={faCalendarCheck} className="me-1" /> 
                    Active Events: {eventCounts[locality.id]?.active || 0}
                  </Badge>
                  <Badge bg="secondary">
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-1" /> 
                    Total Events: {eventCounts[locality.id]?.total || 0}
                  </Badge>
                </div>
                <div className="d-flex justify-content-end">
                  <Button 
                    variant="outline-primary" 
                    className="me-2"
                    onClick={() => handleEdit(locality)}
                  >
                    <FontAwesomeIcon icon={faEdit} className="me-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline-danger"
                    onClick={() => handleDelete(locality.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} className="me-1" />
                    Delete
                  </Button>
                </div>
                <div 
                  className="d-flex align-items-center justify-content-between mt-3 cursor-pointer rooms-header"
                  onClick={() => handleLocalityClick(locality.id)}
                >
                  <h6 className="text-secondary mb-0 flex-grow-1">Rooms</h6>
                  <FontAwesomeIcon 
                    icon={openLocality === locality.id ? faChevronDown : faChevronRight}
                    className="text-secondary"
                    size="sm"
                  />
                </div>
                <Collapse in={openLocality === locality.id}>
                  <div>
                    <RoomList
                      localityId={locality.id}
                      rooms={localityRooms[locality.id] || []}
                      onRoomUpdate={() => loadRoomsForLocality(locality.id)}
                      onLocalityUpdate={() => reloadLocality(locality.id)}
                    />
                  </div>
                </Collapse>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>

      {localities.length === 0 && (
        <div className="text-center py-4">
          <div className="mb-3">
            <FontAwesomeIcon icon={faBuilding} size="3x" className="text-muted" />
          </div>
          <h5>No localities found</h5>
          <p className="text-muted">Add your first locality to start managing spaces</p>
        </div>
      )}

      <div className="add-locality-bottom">
        <button 
          className="btn"
          onClick={() => {
            setCurrentLocality(null);
            resetFormData();
            setShowModal(true);
          }}
          title="Add New Locality"
        >
          <i className="bi bi-plus"></i>
        </button>
      </div>

      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        className="locality-modal"
        centered
        size="lg"
        dialogClassName="locality-modal-dialog"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <span className="modal-title-icon">
              <FontAwesomeIcon icon={faBuilding} className="me-2" />
            </span>
            {currentLocality ? 'Edit Locality' : 'Add New Locality'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="locality-modal-body">
          <Form onSubmit={handleSubmit} className="d-flex flex-column h-100">
            <div className="flex-grow-1">
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-tag"></i></span>
                      <Form.Control
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                        placeholder="Enter locality name"
                        className="form-control-modern"
                      />
                    </div>
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Total Capacity</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-people"></i></span>
                      <Form.Control
                        type="number"
                        min="1"
                        value={formData.totalCapacity}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          
                          // Allow empty input initially
                          if (inputValue === '') {
                            setFormData({...formData, totalCapacity: inputValue});
                            return;
                          }
                          
                          // Only allow positive integers
                          if (!/^[0-9]+$/.test(inputValue)) {
                            return;
                          }
                          
                          const numValue = parseInt(inputValue);
                          
                          // Validate minimum value
                          if (numValue < 1) {
                            console.warn('Minimum capacity is 1');
                            setFormData({...formData, totalCapacity: '1'});
                          } else {
                            setFormData({...formData, totalCapacity: inputValue});
                          }
                        }}
                        required
                        placeholder="Minimum capacity is 1"
                        className="form-control-modern"
                      />
                    </div>
                    <Form.Text className="text-muted">
                      Capacity must be at least 1
                    </Form.Text>
                  </Form.Group>
                </div>
              </div>
              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-geo-alt"></i></span>
                  <Form.Control
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    required
                    placeholder="Street address"
                    className="form-control-modern"
                  />
                </div>
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label>City</Form.Label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-pin-map"></i></span>
                  <CitySelector
                    value={formData.city}
                    onChange={handleCityChange}
                    required={true}
                    placeholder="Start typing to select a city..."
                    className="form-control-modern"
                  />
                </div>
                <Form.Text className="text-muted">
                  Format should be: City, Country
                </Form.Text>
              </Form.Group>
            </div>
            <div className="d-flex justify-content-end mt-auto llisbuttons">
              <Button variant="outline-secondary" className="me-2" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="save-button">
                <i className="bi bi-check-lg me-1"></i>
                Save
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Locality"
        message="Are you sure you want to delete this locality? All rooms within this locality will also be deleted. This action cannot be undone."
      />
    </div>
  );
};

export default LocalityList;
