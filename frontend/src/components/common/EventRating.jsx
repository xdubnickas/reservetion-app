import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { Button, Alert, Row, Col } from 'react-bootstrap';
import { authenticatedRequest } from '../../services/authService';

const EventRating = ({ eventId }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [userRating, setUserRating] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  
  const API_BASE_URL = 'http://localhost:8080';

  useEffect(() => {
    const fetchUserRating = async () => {
      try {
        const response = await authenticatedRequest('GET', true, `${API_BASE_URL}/api/ratings/event/${eventId}/user`);
        if (response.data) {
          setRating(response.data.rating);
          setUserRating(response.data.rating);
        }
      } catch (error) {
        console.error('Error fetching user rating:', error);
      }
    };

    if (eventId) {
      fetchUserRating();
    }
  }, [eventId]);

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      setMessage({ type: 'warning', text: 'Please select at least one star' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    
    try {
      const response = await authenticatedRequest(
        'POST', 
        true, 
        `${API_BASE_URL}/api/ratings/event/${eventId}`, 
        { rating: rating }
      );
      
      setUserRating(rating);
      setMessage({ type: 'success', text: 'Rating submitted successfully!' });
    } catch (error) {
      console.error('Error submitting rating:', error);
      setMessage({ 
        type: 'danger', 
        text: error.response?.data?.error || 'Failed to submit rating. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="evt-rating-component">
      <Row className="align-items-center">
        <Col xs={3} md={3}>
          <h6 className="mb-0">Rate this event:</h6>
        </Col>
        <Col xs={6} md={6}>
          <div className="d-flex align-items-center">
            <div className="star-container me-2">
              {[...Array(5)].map((star, i) => {
                const ratingValue = i + 1;
                
                return (
                  <label key={i} style={{ cursor: 'pointer', marginRight: '3px' }}>
                    <input
                      type="radio"
                      name="rating"
                      value={ratingValue}
                      style={{ display: 'none' }}
                      onClick={() => setRating(ratingValue)}
                    />
                    <FaStar
                      size={20}
                      color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                      onMouseEnter={() => setHover(ratingValue)}
                      onMouseLeave={() => setHover(0)}
                    />
                  </label>
                );
              })}
            </div>
            <span className="rating-value">({rating}/5)</span>
          </div>
        </Col>
        <Col xs={3} md={3} className="text-end">
          <Button 
            size="sm" 
            variant="primary" 
            onClick={handleRatingSubmit}
            disabled={isSubmitting || (userRating === rating && userRating !== 0)}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </Col>
      </Row>

      {message && (
        <Alert variant={message.type} className="py-2 mt-2">
          {message.text}
        </Alert>
      )}
    </div>
  );
};

export default EventRating;
