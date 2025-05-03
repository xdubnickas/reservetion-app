import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { BsEnvelope, BsGeoAlt, BsPhone, BsBuilding, BsClock } from 'react-icons/bs';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import '../styles/ContactPage.css';

const ContactPage = () => {
  return (
    <Container className="contact-page py-5">
      <Row className="justify-content-center mb-5">
        <Col md={10}>
          <div className="text-center contact-header">
            <h1>Contact Us</h1>
            <p className="lead">
              We'd love to hear from you! Whether you have a question about our services, 
              need help with your reservation, or just want to say hello.
            </p>
          </div>
        </Col>
      </Row>
      
      <Row className="justify-content-center g-4 mb-5">
        <Col lg={4} md={6}>
          <Card className="contact-info-card h-100">
            <Card.Body>
              <h3 className="mb-4">Contact Information</h3>
              
              <div className="contact-info-item">
                <BsEnvelope className="contact-icon" />
                <div>
                  <h5>Email</h5>
                  <p><a href="mailto:info@reservo.com">info@reservo.com</a></p>
                </div>
              </div>
              
              <div className="contact-info-item">
                <BsPhone className="contact-icon" />
                <div>
                  <h5>Phone</h5>
                  <p><a href="tel:+421912345678">+421 912 345 678</a></p>
                </div>
              </div>
              
              <div className="contact-info-item">
                <BsGeoAlt className="contact-icon" />
                <div>
                  <h5>Address</h5>
                  <p>Vymyslena 17<br />Bratislava, 81245<br />Slovakia</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4} md={6}>
          <Card className="contact-info-card h-100">
            <Card.Body>
              <h3 className="mb-4">Office Details</h3>
              
              <div className="contact-info-item">
                <BsBuilding className="contact-icon" />
                <div>
                  <h5>Office</h5>
                  <p>4th Floor, SD<br />Building B</p>
                </div>
              </div>
              
              <div className="contact-info-item">
                <BsClock className="contact-icon" />
                <div>
                  <h5>Business Hours</h5>
                  <p>Monday - Friday: 9:00 AM - 5:00 PM<br />Weekend: Closed</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4} md={12}>
          <Card className="contact-info-card h-100">
            <Card.Body>
              <h3 className="mb-4">Connect With Us</h3>
              <p className="mb-4">Follow us on social media for the latest updates, events, and promotions.</p>
              
              <div className="social-media-container">
                <a href="#" className="social-icon-link">
                  <FaFacebook className="social-icon facebook" />
                  <span>Facebook</span>
                </a>
                <a href="#" className="social-icon-link">
                  <FaTwitter className="social-icon twitter" />
                  <span>Twitter</span>
                </a>
                <a href="#" className="social-icon-link">
                  <FaInstagram className="social-icon instagram" />
                  <span>Instagram</span>
                </a>
                <a href="#" className="social-icon-link">
                  <FaLinkedin className="social-icon linkedin" />
                  <span>LinkedIn</span>
                </a>
              </div>
              
              <div className="mt-4">
                <p className="text-muted">For customer support, please email us at <a href="mailto:support@reservo.com">support@reservo.com</a></p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="justify-content-center">
        <Col md={12}>
          <div className="map-container">
            <h3 className="text-center mb-4">Our Location</h3>
            <div className="google-map-embed">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2661.8011326314004!2d17.1209493!3d48.1511827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x476c89474ae6a7b1%3A0x9d42b0d2caac68d0!2sSTU%20Faculty%20of%20Informatics%20and%20Information%20Technologies!5e0!3m2!1sen!2sus!4v1650000000000!5m2!1sen!2sus" 
                width="100%" 
                height="450" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Reservo Office Location"
              ></iframe>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ContactPage;
