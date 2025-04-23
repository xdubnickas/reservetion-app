import { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import EventExplorer from '../components/features/events/EventExplorer';
import '../styles/EventsPage.css';

const EventsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  useEffect(() => {
    // Extract search query from URL
    const params = new URLSearchParams(location.search);
    const query = params.get('search');
    if (query) {
      setSearchQuery(query);
    } else {
      setSearchQuery('');
    }
  }, [location.search]);

  return (
    <Container fluid className="events-page-container py-3">
      <div className="events-page-header text-center mb-4">
        <h1>Discover Amazing Events</h1>
        <p className="lead text-muted">Find and book your next experience</p>
        {searchQuery && (
          <div className="search-results-info mt-3">
            <p>Showing results for: <strong>{searchQuery}</strong></p>
          </div>
        )}
      </div>
      
      <EventExplorer searchQuery={searchQuery} />
    </Container>
  );
};

export default EventsPage;
