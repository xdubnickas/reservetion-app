import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { eventCategories } from '../utils/categoryData';
import { eventService } from '../services/eventService';
import '../styles/CategoriesPage.css';

// Icons for categories
import { 
  FaMusic, FaBasketballBall, FaGraduationCap, 
  FaLaptopCode, FaUtensils, FaPaintBrush, 
  FaHeartbeat, FaMicrophone, FaHandHoldingHeart, 
  FaTshirt, FaLaughBeam, FaBriefcase, FaTools
} from 'react-icons/fa';

const CategoriesPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [categoryEventCounts, setCategoryEventCounts] = useState({});
  
  // Map of category names to their corresponding icons
  const categoryIcons = {
    'Fun': <FaLaughBeam />,
    'Business': <FaBriefcase />,
    'Workshop': <FaTools />,
    'Music': <FaMusic />,
    'Sports': <FaBasketballBall />,
    'Education': <FaGraduationCap />,
    'Technology': <FaLaptopCode />,
    'Food & Drink': <FaUtensils />,
    'Art & Culture': <FaPaintBrush />,
    'Health & Wellness': <FaHeartbeat />,
    'Conference': <FaMicrophone />,
    'Charity': <FaHandHoldingHeart />,
    'Fashion': <FaTshirt />
  };
  
  // Background colors for category cards
  const categoryColors = [
    '#FF6B6B', '#4ECDC4', '#FFD166', '#6A7FDB', '#F9A826',
    '#41B3A3', '#E27D60', '#85CDCA', '#C38D9E', '#8D8741',
    '#5D5C61', '#379683', '#7395AE'
  ];

  // Fetch events and count them by category
  useEffect(() => {
    const fetchEventCounts = async () => {
      try {
        setLoading(true);
        const events = await eventService.getUpcomingEvents();
        
        // Count events by category
        const counts = {};
        eventCategories.forEach(category => {
          counts[category] = 0;
        });
        
        events.forEach(event => {
          if (event.category && counts[event.category] !== undefined) {
            counts[event.category]++;
          }
        });
        
        setCategoryEventCounts(counts);
      } catch (error) {
        console.error('Error fetching event counts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventCounts();
  }, []);
  
  const handleCategoryClick = (category) => {
    // Navigate to the events page with the selected category as a URL parameter
    navigate({
      pathname: '/events',
      search: `?category=${encodeURIComponent(category)}`
    });
  };

  return (
    <Container className="categories-page py-5">
      <div className="text-center mb-5">
        <h1 className="categories-title">Browse Events by Category</h1>
        <p className="categories-subtitle">
          Discover events that match your interests, from business conferences to music concerts
        </p>
      </div>
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary" />
          <p className="mt-3">Loading categories...</p>
        </div>
      ) : (
        <Row className="g-4">
          {eventCategories.map((category, index) => (
            <Col key={category} xs={12} sm={6} md={4} lg={3}>
              <Card 
                className="category-card" 
                onClick={() => handleCategoryClick(category)}
                style={{ 
                  '--category-color': categoryColors[index % categoryColors.length]
                }}
              >
                <div className="category-icon-container">
                  {categoryIcons[category] || <FaLaughBeam />}
                </div>
                <Card.Body>
                  <Card.Title className="category-name">{category}</Card.Title>
                  <div className="category-event-count">
                    {categoryEventCounts[category] || 0} {categoryEventCounts[category] === 1 ? 'event' : 'events'}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      
      <div className="categories-info mt-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <div className="info-box">
              <h3>Can't Find What You're Looking For?</h3>
              <p>
                Our event categories cover a wide range of interests. If you can't find exactly what 
                you're looking for, try using the search and filter options on our <a href="/events">Events page</a>.
              </p>
              <p>
                You can also <a href="/contact">contact us</a> if you'd like to suggest a new category or have any questions.
              </p>
            </div>
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default CategoriesPage;
