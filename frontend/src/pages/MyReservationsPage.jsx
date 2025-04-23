import { useState, useEffect } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { getToken } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import ReservationsList from '../components/common/ReservationsList';
import { getUserReservations, cancelReservation } from '../services/reservationService';
import '../styles/EventList.css';

const MyReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = getToken();
        if (!token) {
          navigate('/');
          return;
        }

        const data = await getUserReservations();
        setReservations(data);
        setFilteredReservations(data);
        setLoading(false);
      } catch {
        setError('Failed to load your reservations');
        setLoading(false);
      }
    };

    fetchReservations();
  }, [navigate]);

  // Apply filtering when status filter changes
  useEffect(() => {
    if (reservations.length) {
      if (statusFilter === 'ALL') {
        setFilteredReservations(reservations);
      } else {
        setFilteredReservations(reservations.filter(reservation => reservation.status === statusFilter));
      }
    }
  }, [reservations, statusFilter]);

  const handleCancelReservation = async (id) => {
    try {
      await cancelReservation(id);
      
      // Update the reservation status in the local state
      const updatedReservations = reservations.map(res => 
        res.id === id 
          ? { ...res, status: 'CANCELLED' } 
          : res
      );
      
      setReservations(updatedReservations);
      // Also update filtered reservations if we're not viewing "CANCELLED" only
      if (statusFilter !== 'CANCELLED') {
        setFilteredReservations(prev => prev.map(res => 
          res.id === id 
            ? { ...res, status: 'CANCELLED' } 
            : res
        ));
      }
      
      return true;
    } catch (err) {
      setError('Failed to cancel reservation. Please try again.');
      throw err;
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <div className="alert alert-danger">{error}</div>
      </Container>
    );
  }

  return (
    <Container className="mt-5 event-list">
      <div className="d-flex justify-content-between mb-3">
        <h3>My Reservations</h3>
      </div>

      <ReservationsList 
        reservations={filteredReservations}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onCancelReservation={handleCancelReservation}
        showEventImage={false}
        disableRatingForInactive={false} // Add this prop to prevent graying out rating area for inactive events
      />
    </Container>
  );
};

export default MyReservationsPage;
