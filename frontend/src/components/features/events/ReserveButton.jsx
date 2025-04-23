import { useState } from 'react';
import { Button, Modal, Spinner, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { eventService } from '../../../services/eventService';
import { getToken } from '../../../services/authService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaTicketAlt, FaCalendarCheck, FaClock, FaEuroSign, FaBan, FaExclamationCircle } from 'react-icons/fa';
import moment from 'moment';
import PropTypes from 'prop-types';
import './ReserveButton.css';

const ReserveButton = ({ event, className, size = "md", block = false }) => {
  const [showModal, setShowModal] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const navigate = useNavigate();

  // Check if event is reservable
  const isEventFull = event.status === 'FULL';
  const isEventInactive = event.status === 'INACTIVE';
  const canBeReserved = !isEventFull && !isEventInactive;

  const handleShowModal = (e) => {
    // Stop event propagation to prevent the card's onClick from firing
    if (e) e.stopPropagation();

    // If event can't be reserved, show appropriate message
    if (!canBeReserved) {
      toast.warning(isEventFull ? "This event is fully booked" : "This event is inactive and cannot be reserved");
      return;
    }

    // Check authentication status at the time of clicking
    const isAuthenticated = !!getToken();

    if (!isAuthenticated) {
      toast.info('Please log in to reserve this event');
      navigate('/signup', { state: { from: window.location.pathname } });
      return;
    }
    setShowModal(true);
  };

  const handleCloseModal = (e) => {
    // Stop event propagation to prevent the card's onClick from firing
    if (e) e.stopPropagation();
    setShowModal(false);
  };

  const handleReserve = async (e) => {
    // Stop event propagation to prevent the card's onClick from firing
    if (e) e.stopPropagation();

    try {
      setIsReserving(true);
      await eventService.createReservation(event.id);
      setIsReserving(false);
      setShowModal(false);
      toast.success('Event reserved successfully!');
    } catch (error) {
      console.error('Error reserving event:', error);
      setIsReserving(false);

      // Handle specific error messages from the server
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || 'Failed to reserve this event. Please try again.');
      } else {
        toast.error('Failed to reserve this event. Please try again.');
      }
    }
  };

  // Render different button based on event status
  const renderButton = () => {
    if (isEventFull) {
      return (
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>This event is fully booked</Tooltip>}
        >
          <span className="d-inline-block w-100">
            <Button 
              variant="secondary" 
              className={`reserve-btn ${block ? 'w-100' : ''} ${className || ''}`}
              disabled
              size={size}
            >
              <FaBan className="me-2" />
              Fully Booked
            </Button>
          </span>
        </OverlayTrigger>
      );
    }

    if (isEventInactive) {
      return (
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>This event is inactive and cannot be reserved</Tooltip>}
        >
          <span className="d-inline-block w-100">
            <Button 
              variant="secondary" 
              className={`reserve-btn ${block ? 'w-100' : ''} ${className || ''}`}
              disabled
              size={size}
            >
              <FaExclamationCircle className="me-2" />
              Not Available
            </Button>
          </span>
        </OverlayTrigger>
      );
    }

    return (
      <Button 
        variant="success" 
        className={`reserve-btn ${block ? 'w-100' : ''} ${className || ''}`}
        onClick={handleShowModal}
        size={size}
      >
        <FaTicketAlt className="me-2" />
        Reserve
      </Button>
    );
  };

  return (
    <>
      {renderButton()}

      <Modal 
        show={showModal} 
        onHide={handleCloseModal} 
        centered 
        className="reservation-modal"
        onClick={(e) => e.stopPropagation()} // Stop propagation on the entire modal
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaCalendarCheck className="me-2 text-success" />
            Reserve Event
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="event-modal-header mb-3">
            <h5>{event.name}</h5>
            <Badge bg="primary" pill className="category-badge">
              {event.category || 'Event'}
            </Badge>
          </div>
          
          <div className="event-modal-details">
            <div className="detail-row">
              <div className="detail-icon">
                <FaCalendarCheck />
              </div>
              <div>
                <strong>Date:</strong> {moment(event.eventDate).format('dddd, MMMM D, YYYY')}
              </div>
            </div>
            
            <div className="detail-row">
              <div className="detail-icon">
                <FaClock />
              </div>
              <div>
                <strong>Time:</strong> {moment(event.startTime, 'HH:mm:ss').format('HH:mm')}
              </div>
            </div>
            
            <div className="detail-row">
              <div className="detail-icon">
                <FaEuroSign />
              </div>
              <div>
                <strong>Price:</strong> <span className="price-value">{event.price} €</span>
              </div>
            </div>
          </div>
          
          <div className="confirmation-message mt-3">
            <p>Are you sure you want to reserve a spot for this event?</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="outline-secondary" 
            onClick={handleCloseModal}
          >
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={handleReserve}
            disabled={isReserving}
            className="confirm-btn"
          >
            {isReserving ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Processing...</span>
              </>
            ) : (
              <>
                <FaTicketAlt className="me-2" />
                Confirm Reservation
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

ReserveButton.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string,
    eventDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
    startTime: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    status: PropTypes.string
  }).isRequired,
  className: PropTypes.string,
  size: PropTypes.string,
  block: PropTypes.bool
};

export default ReserveButton;
