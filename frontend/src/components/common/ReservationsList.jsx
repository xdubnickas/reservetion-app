import React, { useState } from 'react';
import { Row, Col, Card, Button, Modal } from 'react-bootstrap';
import { format } from 'date-fns';
import { BsCheck2Circle, BsExclamationTriangle, BsXCircle, BsFilter, BsCalendarCheck, BsInfoCircle } from 'react-icons/bs';
import EventRating from './EventRating';
import { useNavigate } from 'react-router-dom';

const ReservationsList = ({ 
  reservations, 
  statusFilter, 
  setStatusFilter, 
  onCancelReservation,
  showEventImage = true
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const navigate = useNavigate();
  
  const getStatusIcon = (status) => {
    switch(status) {
      case 'CONFIRMED': return <BsCheck2Circle className="status-icon active" />;
      case 'PENDING': return <BsExclamationTriangle className="status-icon full" />;
      case 'CANCELLED': return <BsXCircle className="status-icon inactive" />;
      default: return null;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'CONFIRMED': return 'Confirmed';
      case 'PENDING': return 'Pending';
      case 'CANCELLED': return 'Cancelled';
      default: return status || 'Unknown';
    }
  };

  const getCardBgClass = (status, eventStatus) => {
    if (eventStatus === 'INACTIVE') return 'status-event-inactive';
    
    switch(status) {
      case 'CONFIRMED': return 'status-active';
      case 'PENDING': return 'status-full';
      case 'CANCELLED': return 'status-inactive';
      default: return '';
    }
  };
  
  const handleCancelClick = (reservation) => {
    setSelectedReservation(reservation);
    setShowCancelModal(true);
  };

  const handleCancelReservation = async () => {
    if (!selectedReservation) return;
    
    setCancelling(true);
    try {
      await onCancelReservation(selectedReservation.id);
      setShowCancelModal(false);
    } catch (err) {
      console.error("Failed to cancel reservation:", err);
    } finally {
      setCancelling(false);
    }
  };

  const handleViewEvent = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  return (
    <>
      {/* Status Filter */}
      <div className="status-filter-container mb-4">
        <Row>
          <Col>
            <div className="status-filter">
              <div className="filter-header">
                <BsFilter className="filter-icon" />
                <span>Filter by Status</span>
              </div>
              <div className="filter-options">
                <div 
                  className={`filter-option ${statusFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('ALL')}
                >
                  <span>All</span>
                </div>
                <div 
                  className={`filter-option ${statusFilter === 'CONFIRMED' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('CONFIRMED')}
                >
                  <BsCheck2Circle />
                  <span>Confirmed</span>
                </div>
                <div 
                  className={`filter-option ${statusFilter === 'PENDING' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('PENDING')}
                >
                  <BsExclamationTriangle />
                  <span>Pending</span>
                </div>
                <div 
                  className={`filter-option ${statusFilter === 'CANCELLED' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('CANCELLED')}
                >
                  <BsXCircle />
                  <span>Cancelled</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
      
      {reservations.length === 0 ? (
        <div className="alert alert-info">No reservations found with the selected filter.</div>
      ) : (
        <div className="row">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="col-md-6 mb-3">
              <Card className={`event-card ${getCardBgClass(reservation.status, reservation.eventStatus)}`}>
                <Card.Body>
                  <div className="event-card-header">
                    <Card.Title>{reservation.eventName}</Card.Title>
                    <div className="event-status">
                      {getStatusIcon(reservation.status)}
                      <span className="status-text">
                        {getStatusText(reservation.status)}
                        {reservation.eventStatus === 'INACTIVE' && 
                          <span className="ms-2 text-secondary">(Event Inactive)</span>
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="d-flex flex-column flex-md-row">
                    <div className={reservation.eventImagePath ? "col-md-8" : "col-12"}>
                      <table className="table-sm">
                        <tbody>
                          <tr>
                            <td><strong>Date:</strong></td>
                            <td>{reservation.eventDate && format(new Date(reservation.eventDate), 'PPP')}</td>
                          </tr>
                          <tr>
                            <td><strong>Time:</strong></td>
                            <td>{reservation.eventStartTime} - {reservation.eventEndTime}</td>
                          </tr>
                          <tr>
                            <td><strong>Category:</strong></td>
                            <td>{reservation.eventCategory}</td>
                          </tr>
                          <tr>
                            <td><strong>Price:</strong></td>
                            <td>€{reservation.eventPrice}</td>
                          </tr>
                        </tbody>
                      </table>

                      <div className="reservation-date mt-3">
                        <BsCalendarCheck className="me-1" />
                        <small className="text-muted">Reserved on {format(new Date(reservation.reservationDate), 'PPP')}</small>
                      </div>
                    </div>

                    {reservation.eventImagePath && showEventImage && (
                      <div className="col-md-4 d-flex align-items-center justify-content-center mt-3 mt-md-0">
                        <img 
                          src={`http://localhost:8080/api/images/${reservation.eventImagePath}`} 
                          alt={reservation.eventName}
                          className="img-fluid rounded"
                          style={{ height: '100px', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Action buttons */}
                  <div className="d-flex justify-content-between mt-3">
                    {/* View Event Button */}
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleViewEvent(reservation.eventId)}
                    >
                      <BsInfoCircle className="me-1" />
                      View Event
                    </Button>

                    {/* Only show Cancel button inside the card if the event is not inactive */}
                    {reservation.eventStatus !== 'INACTIVE' && (
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleCancelClick(reservation)}
                        disabled={reservation.status === 'CANCELLED'}
                      >
                        Cancel Reservation
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
              
              {/* Render rating component outside the card for inactive events */}
              {reservation.eventStatus === 'INACTIVE' && (
                <div className="mt-2 rating-container">
                  <EventRating 
                    eventId={reservation.eventId}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Reservation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to cancel your reservation for 
          <strong> {selectedReservation?.eventName}</strong>?
          <div className="text-danger mt-2">This action cannot be undone.</div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            No, Keep Reservation
          </Button>
          <Button 
            variant="danger" 
            onClick={handleCancelReservation}
            disabled={cancelling}
          >
            {cancelling ? 'Cancelling...' : 'Yes, Cancel Reservation'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ReservationsList;
