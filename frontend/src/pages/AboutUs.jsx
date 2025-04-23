import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaUserCircle, FaBuilding, FaCalendarAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../styles/AboutUs.css';

const AboutUs = () => {
  return (
    <Container className="about-page mt-5">
      <Row className="mb-5 text-center">
        <Col>
          <h1 className="about-title">About Reservo</h1>
          <p className="about-subtitle">
            Reservo is a comprehensive reservation platform connecting event attendees, 
            venue owners, and event organizers in one seamless ecosystem.
          </p>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col md={4} className="mb-4">
          <Card className="user-card h-100">
            <Card.Body className="text-center">
              <div className="icon-wrapper mb-4">
                <FaUserCircle size={60} />
              </div>
              <Card.Title>Registered User</Card.Title>
              <Card.Text>
                Regular users who can browse events, purchase tickets, and manage their reservations.
                Registered users can set preferences for cities, price ranges, and event categories
                to personalize their experience.
              </Card.Text>
              <ul className="text-start user-features">
                <li>Browse and search events</li>
                <li>Purchase tickets</li>
                <li>Manage personal reservations</li>
                <li>Set preferences for personalized recommendations</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="user-card h-100">
            <Card.Body className="text-center">
              <div className="icon-wrapper mb-4">
                <FaBuilding size={60} />
              </div>
              <Card.Title>Space Renter</Card.Title>
              <Card.Text>
                Venue owners who provide locations for various events. Space renters can list their
                properties and manage bookings through our platform.
              </Card.Text>
              <ul className="text-start user-features">
                <li>List multiple venues and localities</li>
                <li>Manage venue availability</li>
                <li>Set pricing and terms</li>
                <li>Track bookings and occupancy</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="user-card h-100">
            <Card.Body className="text-center">
              <div className="icon-wrapper mb-4">
                <FaCalendarAlt size={60} />
              </div>
              <Card.Title>Event Organizer</Card.Title>
              <Card.Text>
                Professionals who create and manage events. Event organizers can find venues,
                set up events, and manage attendees all in one place.
              </Card.Text>
              <ul className="text-start user-features">
                <li>Create and publish events</li>
                <li>Find and book suitable venues</li>
                <li>Manage ticket sales</li>
                <li>Promote events through the platform</li>
                <li>Track attendance and analytics</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col>
          <h2 className="section-title">How It Works</h2>
          <p className="section-text">
            Our platform creates a seamless ecosystem where venue owners can list their spaces,
            event organizers can find and book these venues, and users can discover and attend
            exciting events. This three-way connection ensures that everyone benefits from 
            a streamlined reservation process.
          </p>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col>
          <h2 className="section-title">Our Mission</h2>
          <p className="section-text">
            At Reservo, we're dedicated to simplifying the event management process by connecting
            the right people with the right spaces. Our goal is to make organizing, hosting, and 
            attending events as easy and enjoyable as possible.
          </p>
        </Col>
      </Row>

      <Row className="mb-5 text-center join-us-section">
        <Col>
          <h2 className="section-title">Ready to Get Started?</h2>
          <p className="about-subtitle mb-4">
            Join our community today and experience the benefits of our reservation platform.
          </p>
          <Link to="/signup">
            <Button className="join-us-button">
              Join Reservo Now
            </Button>
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default AboutUs;
