import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { FaUser, FaBuilding, FaCalendarCheck, FaSignInAlt } from 'react-icons/fa';
import ValidationFeedback from '../components/common/ValidationFeedback';
import { useSignUpForm } from '../hooks/useSignUpForm';
import { register, login } from '../services/authService';
import '../styles/SignUpPage.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useState } from 'react';

const SignUpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formData, validation, handleInputChange, handleBlur, isFormValid, touchedFields } = useSignUpForm();
  
  // Add state for login form
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      toast.error("Please fix all validation errors before submitting.");
      return;
    }

    try {
      await register(formData);
      toast.success('Welcome to Reservo! 🎉');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data || 'Registration failed. Please try again.');
    }
  };

  // Add login form handlers
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const role = await login(loginData.username, loginData.password);
      toast.success('Login successful!');
      
      // Redirect based on role or to the page the user was trying to access
      const from = location.state?.from || '/';
      if (role === 'SPACE_RENTER') {
        navigate('/space-renter');
      } else if (role === 'EVENT_ORGANIZER') {
        navigate('/event-organizer');
      } else {
        navigate(from);
      }
    } catch {
      setLoginError('Invalid username or password');
      toast.error('Login failed. Please check your credentials.');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Row className="w-100">
        <Col xs={12} md={8} lg={8} className="mx-auto">
          <Row className="mb-4">
            <Col>
              <h2 className="text-center">Account Access</h2>
            </Col>
          </Row>
          
          {/* Login section - now above the sign-up form */}
          <Row className="mb-4">
            <Col xs={12}>
              <Card className="signup-form-container">
                <Card.Body>
                  <h3 className="text-center mb-4">
                    <FaSignInAlt className="me-2" />
                    Log In
                  </h3>
                  <Form onSubmit={handleLoginSubmit}>
                    <Row>
                      {/* Username and Password on one row for larger screens */}
                      <Col xs={12} md={6}>
                        <Form.Group className="mb-3" controlId="loginUsername">
                          <Form.Label>Username</Form.Label>
                          <Form.Control
                            type="text"
                            name="username"
                            placeholder="Enter username"
                            value={loginData.username}
                            onChange={handleLoginChange}
                            required
                            className="dark-mode-input"
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} md={6}>
                        <Form.Group className="mb-3" controlId="loginPassword">
                          <Form.Label>Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={loginData.password}
                            onChange={handleLoginChange}
                            required
                            className="dark-mode-input"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                        
                    {loginError && <div className="alert alert-danger mb-3">{loginError}</div>}
                    
                    <div className="text-center">
                      <Button variant="primary" type="submit" className="mt-3 navbar-btn login-btn signup-btn">
                        Log In
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
            
          {/* Sign Up section - now below the login form */}
          <Row>
            <Col xs={12}>
              <div className="signup-form-container">
                <h3 className="text-center mb-4">Sign Up</h3>
                <Form onSubmit={handleSubmit}>
                  {/* Username and Email in one row */}
                  <Row className="mb-3">
                    <Col xs={12} md={6}>
                      <Form.Group controlId="formUsername">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter username"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          onBlur={() => handleBlur('username')}
                          required
                          className={`dark-mode-input ${
                            touchedFields.username ? 
                            (validation.username.isValid ? 'is-valid' : 'is-invalid') : 
                            ''
                          }`}
                          maxLength={30}
                        />
                        <ValidationFeedback 
                          validation={validation.username} 
                          showValidation={touchedFields.username}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group controlId="formEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="Enter email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          onBlur={() => handleBlur('email')}
                          required
                          className={`dark-mode-input ${
                            touchedFields.email ? 
                            (validation.email.isValid ? 'is-valid' : 'is-invalid') : 
                            ''
                          }`}
                          maxLength={100}
                        />
                        <ValidationFeedback 
                          validation={validation.email} 
                          showValidation={touchedFields.email}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* First Name and Last Name */}
                  <Row className="mb-3">
                    <Col xs={12} md={6}>
                      <Form.Group controlId="formFirstName">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter first name"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          onBlur={() => handleBlur('firstName')}
                          required
                          className={`dark-mode-input ${
                            touchedFields.firstName ? 
                            (validation.firstName.isValid ? 'is-valid' : 'is-invalid') : 
                            ''
                          }`}
                          maxLength={50}
                        />
                        <ValidationFeedback 
                          validation={validation.firstName} 
                          showValidation={touchedFields.firstName}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group controlId="formLastName">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter last name"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          onBlur={() => handleBlur('lastName')}
                          required
                          className={`dark-mode-input ${
                            touchedFields.lastName ? 
                            (validation.lastName.isValid ? 'is-valid' : 'is-invalid') : 
                            ''
                          }`}
                          maxLength={50}
                        />
                        <ValidationFeedback 
                          validation={validation.lastName} 
                          showValidation={touchedFields.lastName}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Password and Confirm Password */}
                  <Row className="mb-3">
                    <Col xs={12} md={6}>
                      <Form.Group controlId="formPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          onBlur={() => handleBlur('password')}
                          required
                          className={`dark-mode-input ${
                            touchedFields.password ? 
                            (validation.password.isValid ? 'is-valid' : 'is-invalid') : 
                            ''
                          }`}
                        />
                        <ValidationFeedback 
                          validation={validation.password} 
                          showValidation={touchedFields.password}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group controlId="formConfirmPassword">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Confirm Password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          onBlur={() => handleBlur('confirmPassword')}
                          required
                          className={`dark-mode-input ${
                            touchedFields.confirmPassword ? 
                            (validation.confirmPassword.isValid ? 'is-valid' : 'is-invalid') : 
                            ''
                          }`}
                        />
                        <ValidationFeedback 
                          validation={validation.confirmPassword} 
                          showValidation={touchedFields.confirmPassword}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* User Type Selection */}
                  <Row className="mb-3">
                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label>Select User Type</Form.Label>
                        <div className="d-flex justify-content-between user-type-radio">
                          <Form.Check
                            type="radio"
                            id="normalUser"
                            name="userType"
                            label={<><FaUser className="me-2" /> Normal User</>}
                            value="REGISTERED_USER"
                            checked={formData.userType === 'REGISTERED_USER'}
                            onChange={handleInputChange}
                            className="me-3"
                          />
                          <Form.Check
                            type="radio"
                            id="SpaceRenter"
                            name="userType"
                            label={<><FaBuilding className="me-2" /> Space Renter</>}
                            value="SPACE_RENTER"
                            checked={formData.userType === 'SPACE_RENTER'}
                            onChange={handleInputChange}
                            className="me-3"
                          />
                          <Form.Check
                            type="radio"
                            id="eventOrganizer"
                            name="userType"
                            label={<><FaCalendarCheck className="me-2" /> Event Organizer</>}
                            value="EVENT_ORGANIZER"
                            checked={formData.userType === 'EVENT_ORGANIZER'}
                            onChange={handleInputChange}
                          />
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Phone Number and Company Name */}
                  <Row className="mb-3">
                    <Col xs={12} md={6}>
                      <Form.Group controlId="formPhone">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter phone number"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          onBlur={() => handleBlur('phone')}
                          disabled={formData.userType === 'REGISTERED_USER'}
                          required={formData.userType !== 'REGISTERED_USER'}
                          className={`dark-mode-input ${
                            !formData.userType === 'REGISTERED_USER' && touchedFields.phone ? 
                            (validation.phone.isValid ? 'is-valid' : 'is-invalid') : 
                            ''
                          }`}
                          maxLength={20}
                        />
                        <ValidationFeedback 
                          validation={validation.phone} 
                          showValidation={touchedFields.phone}
                          hidden={formData.userType === 'REGISTERED_USER'}
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={12} md={6}>
                      <Form.Group controlId="formCompanyName">
                        <Form.Label>Company Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter company name"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          onBlur={() => handleBlur('companyName')}
                          disabled={formData.userType === 'REGISTERED_USER' || formData.userType === 'SPACE_RENTER'}
                          required={formData.userType === 'EVENT_ORGANIZER'}
                          className={`dark-mode-input ${
                            formData.userType === 'EVENT_ORGANIZER' && touchedFields.companyName ? 
                            (validation.companyName.isValid ? 'is-valid' : 'is-invalid') : 
                            ''
                          }`}
                          maxLength={100}
                        />
                        {formData.userType === 'EVENT_ORGANIZER' &&
                          <ValidationFeedback 
                            validation={validation.companyName} 
                            showValidation={touchedFields.companyName}
                          />
                        }
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="text-center">
                    <Button variant="primary" type="submit" className="mt-4 navbar-btn signup-btn">
                      Sign Up
                    </Button>
                  </div>
                </Form>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default SignUpPage;