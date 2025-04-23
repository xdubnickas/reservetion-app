import { Container, Row, Col } from 'react-bootstrap';
import '../../styles/Footer.css'; // Ak máte vlastný štýl pre footer

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row>
          <Col sm={12} md={4} className="text-center text-md-left">
            <h5>About Us</h5>
            <p>
              We provide the best booking solutions for events and spaces. Discover
              new places and events to make your experience better.
            </p>
          </Col>
          <Col sm={12} md={4} className="text-center">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/about">About Us</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a href="/terms">Terms & Conditions</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
            </ul>
          </Col>
          <Col sm={12} md={4} className="text-center text-md-right">
            <h5>Contact</h5>
            <p>
              Email: support@example.com <br />
              Phone: +123 456 789
            </p>
          </Col>
        </Row>
        <Row>
          <Col className="text-center">
            <p>&copy; {new Date().getFullYear()} Event Booking. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
