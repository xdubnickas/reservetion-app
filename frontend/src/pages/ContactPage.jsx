import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { BsEnvelope, BsGeoAlt, BsPhone, BsBuilding, BsClock } from 'react-icons/bs';
import { toast } from 'react-toastify';
import '../styles/ContactPage.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [validated, setValidated] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    setSending(true);
    
    // Simulate sending the message
    setTimeout(() => {
      toast.success('Your message has been sent successfully! We will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      setValidated(false);
      setSending(false);
    }, 1500);
  };

  return (
    <Container className="contact-page py-5">
      <Row className="justify-content-center mb-5">
        <Col md={10} lg={8}>
          <div className="text-center contact-header">
            <h1>Contact Us</h1>
            <p className="lead">
              We'd love to hear from you! Whether you have a question about our services, 
              need help with your reservation, or just want to say hello.
            </p>
          </div>
        </Col>
      </Row>
      
      <Row className="justify-content-center g-4">
        <Col lg={5} md={6}>
          <Card className="contact-info-card h-100">
            <Card.Body>
              <h3 className="mb-4">Get in Touch</h3>
              
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
                  <p>Námestie Slobody 17<br />Bratislava, 81245<br />Slovakia</p>
                </div>
              </div>
              
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
        
        <Col lg={7} md={6}>
          <Card className="contact-form-card h-100">
            <Card.Body>
              <h3 className="mb-4">Send us a Message</h3>
              
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="contactName">
                  <Form.Label>Your Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your name"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide your name.
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="contactEmail">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a valid email address.
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="contactSubject">
                  <Form.Label>Subject</Form.Label>
                  <Form.Control
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="What is this regarding?"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a subject.
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-4" controlId="contactMessage">
                  <Form.Label>Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Tell us how we can help you..."
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a message.
                  </Form.Control.Feedback>
                </Form.Group>
                
                <div className="d-grid">
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={sending}
                    className="send-message-btn"
                  >
                    {sending ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="justify-content-center mt-5">
        <Col md={10}>
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
