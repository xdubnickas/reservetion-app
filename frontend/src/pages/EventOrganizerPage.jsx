import { useState, useEffect } from 'react';
import EventList from '../components/common/EventList';
import { eventService } from '../services/eventService';
import { BsStarFill, BsStarHalf, BsStar, BsCalendarEvent, BsCalendarCheck } from 'react-icons/bs';

const EventOrganizerPage = () => {
  const [organizerStats, setOrganizerStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    averageRating: 0,
  });

  useEffect(() => {
    const loadOrganizerStats = async () => {
      try {
        // Get events to calculate stats
        const events = await eventService.getMyEvents();
        
        if (events && events.length > 0) {
          // Extract organizer data from the first event (all events belong to the same organizer)
          const organizerRating = events[0].eventOrganizer?.averageRating || 0;
          
          // Calculate total and active events
          const totalEvents = events.length;
          const activeEvents = events.filter(event => event.status === 'ACTIVE').length;
          
          setOrganizerStats({
            totalEvents,
            activeEvents,
            averageRating: organizerRating
          });
        }
      } catch (error) {
        console.error('Failed to load organizer statistics:', error);
      }
    };
    
    loadOrganizerStats();
  }, []);

  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<BsStarFill key={`full-${i}`} className="rating-star filled" />);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<BsStarHalf key="half" className="rating-star half-filled" />);
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<BsStar key={`empty-${i}`} className="rating-star empty" />);
    }
    
    return (
      <div className="star-rating">
        {stars}
        <span className="rating-value ms-2">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="container mt-4">
      <h1>Event Organizer Dashboard</h1>
      
      {organizerStats.averageRating > 0 && (
        <div className="organizer-stats-card mt-3 mb-4">
          <div className="row align-items-center">
            <div className="col-md-4">
              <div className="stat-item">
                <h5>Your Rating</h5>
                <div className="big-rating">
                  {renderStarRating(organizerStats.averageRating)}
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-item">
                <h5>Total Events</h5>
                <div className="stat-value">
                  <BsCalendarEvent className="me-2" />
                  {organizerStats.totalEvents}
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-item">
                <h5>Active Events</h5>
                <div className="stat-value">
                  <BsCalendarCheck className="me-2" />
                  {organizerStats.activeEvents}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="row mt-4">
        <div className="col-12">
          <EventList />
        </div>
      </div>
    </div>
  );
};

export default EventOrganizerPage;
