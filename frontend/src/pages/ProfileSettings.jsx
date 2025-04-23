import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaBuilding } from 'react-icons/fa';
import { getUserRole, getToken, getUserName } from '../services/authService';
import axios from 'axios';
import '../styles/ProfileSettings.css';

// Base URL for the backend API
const API_BASE_URL = 'http://localhost:8080';

const ProfileSettings = () => {
  const [userData, setUserData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    companyName: ''
  });
  
  const [validation, setValidation] = useState({
    email: { isValid: true, message: '' },
    password: { isValid: true, message: '' },
    confirmPassword: { isValid: true, message: '' },
    phone: { isValid: true, message: '' },
    companyName: { isValid: true, message: '' }
  });
  
  const [touchedFields, setTouchedFields] = useState({
    email: false,
    password: false,
    confirmPassword: false,
    phone: false,
    companyName: false
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userRole, setUserRole] = useState('');
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const role = getUserRole();
        setUserRole(role);
        const username = getUserName();
        
        let endpoint = '';
        if (role === 'SPACE_RENTER') {
          endpoint = `/api/space-renters/username/${username}`;
        } else if (role === 'EVENT_ORGANIZER') {
          endpoint = `/api/event-organizers/username/${username}`;
        } else {
          endpoint = `/api/persons/username/${username}`;
        }
        
        const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        });
        
        setUserData({
          email: response.data.email || '',
          password: '',
          confirmPassword: '',
          phone: response.data.mobilePhoneNumber || '',
          companyName: response.data.organizationName || ''
        });
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError('Failed to load user data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
    
    validateField(name, value);
  };
  
  const handleBlur = (field) => {
    setTouchedFields(prev => ({
      ...prev,
      [field]: true
    }));
    
    validateField(field, userData[field]);
  };
  
  const validateField = (field, value) => {
    let isValid = true;
    let message = '';
    
    switch (field) {
      case 'email':
        if (!value) {
          isValid = false;
          message = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          isValid = false;
          message = 'Email address is invalid';
        }
        break;
        
      case 'password':
        if (value && value.length < 8) {
          isValid = false;
          message = 'Password must be at least 8 characters';
        }
        break;
        
      case 'confirmPassword':
        if (userData.password && value !== userData.password) {
          isValid = false;
          message = 'Passwords do not match';
        }
        break;
        
      case 'phone':
        if ((userRole === 'SPACE_RENTER' || userRole === 'EVENT_ORGANIZER') && !value) {
          isValid = false;
          message = 'Phone number is required';
        } else if (value && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(value)) {
          isValid = false;
          message = 'Phone number is invalid';
        }
        break;
        
      case 'companyName':
        if (userRole === 'EVENT_ORGANIZER' && !value) {
          isValid = false;
          message = 'Company name is required';
        }
        break;
        
      default:
        break;
    }
    
    setValidation(prev => ({
      ...prev,
      [field]: { isValid, message }
    }));
    
    return isValid;
  };
  
  const validateAllFields = () => {
    let isValid = true;
    
    // If password field is filled, validate password and confirmPassword
    if (userData.password) {
      const isPasswordValid = validateField('password', userData.password);
      const isConfirmPasswordValid = validateField('confirmPassword', userData.confirmPassword);
      if (!isPasswordValid || !isConfirmPasswordValid) {
        isValid = false;
      }
    }
    
    // Always validate email
    if (!validateField('email', userData.email)) {
      isValid = false;
    }
    
    // Validate phone for SPACE_RENTER and EVENT_ORGANIZER
    if (userRole === 'SPACE_RENTER' || userRole === 'EVENT_ORGANIZER') {
      if (!validateField('phone', userData.phone)) {
        isValid = false;
      }
    }
    
    // Validate companyName for EVENT_ORGANIZER
    if (userRole === 'EVENT_ORGANIZER') {
      if (!validateField('companyName', userData.companyName)) {
        isValid = false;
      }
    }
    
    // Mark all fields as touched
    setTouchedFields({
      email: true,
      password: userData.password ? true : false,
      confirmPassword: userData.password ? true : false,
      phone: (userRole === 'SPACE_RENTER' || userRole === 'EVENT_ORGANIZER') ? true : false,
      companyName: (userRole === 'EVENT_ORGANIZER') ? true : false
    });
    
    return isValid;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateAllFields()) {
      setError('Please fix the validation errors before submitting.');
      return;
    }
    
    try {
      const username = getUserName();
      let endpoint = '';
      
      if (userRole === 'SPACE_RENTER') {
        endpoint = `/api/space-renters/username/${username}`;
      } else if (userRole === 'EVENT_ORGANIZER') {
        endpoint = `/api/event-organizers/username/${username}`;
      } else {
        endpoint = `/api/persons/username/${username}`;
      }
      
      const dataToUpdate = {
        email: userData.email
      };
      
      if (userData.password) {
        dataToUpdate.password = userData.password;
      }
      
      if (userRole === 'SPACE_RENTER' || userRole === 'EVENT_ORGANIZER') {
        dataToUpdate.mobilePhoneNumber = userData.phone;
        
        if (userRole === 'EVENT_ORGANIZER') {
          dataToUpdate.organizationName = userData.companyName;
        }
      }
      
      await axios.put(`${API_BASE_URL}${endpoint}`, dataToUpdate, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      
      setSuccess('Your profile has been updated successfully!');
      
      // Reset password fields after successful update
      setUserData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
      
      // Reset touched state for password fields
      setTouchedFields(prev => ({
        ...prev,
        password: false,
        confirmPassword: false
      }));
      
    } catch (err) {
      console.error("Error updating profile:", err);
      setError('Failed to update profile. Please try again later.');
    }
  };
  
  if (loading) {
    return (
      <Container className="mt-5">
        <div className="text-center">
          <p>Loading user data...</p>
        </div>
      </Container>
    );
  }
  
  return (
    <Container className="profile-settings-container my-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="profile-card">
            <Card.Body>
              <div className="text-center mb-4">
                <div className="profile-icon-container">
                  <FaUser className="profile-icon" />
                </div>
                <h2 className="profile-title mt-3">Profile Settings</h2>
                <p className="text-muted">Update your account information</p>
              </div>
              
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label">
                    <FaEnvelope className="form-icon" /> Email
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('email')}
                    required
                    className={`form-control-custom ${
                      touchedFields.email ? (validation.email.isValid ? 'is-valid' : 'is-invalid') : ''
                    }`}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label className="form-label">
                    <FaLock className="form-icon" /> New Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={userData.password}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('password')}
                    placeholder="Leave blank to keep current password"
                    className={`form-control-custom ${
                      touchedFields.password && userData.password ? (validation.password.isValid ? 'is-valid' : 'is-invalid') : ''
                    }`}
                  />
                  <Form.Text className="text-muted">
                    Minimum 8 characters. Leave blank if you don't want to change.
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label className="form-label">
                    <FaLock className="form-icon" /> Confirm New Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={userData.confirmPassword}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('confirmPassword')}
                    placeholder="Confirm new password"
                    className={`form-control-custom ${
                      touchedFields.confirmPassword && userData.password ? (validation.confirmPassword.isValid ? 'is-valid' : 'is-invalid') : ''
                    }`}
                  />
                </Form.Group>
                
                {(userRole === 'SPACE_RENTER' || userRole === 'EVENT_ORGANIZER') && (
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label">
                      <FaPhone className="form-icon" /> Phone Number
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="phone"
                      value={userData.phone}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('phone')}
                      required
                      className={`form-control-custom ${
                        touchedFields.phone ? (validation.phone.isValid ? 'is-valid' : 'is-invalid') : ''
                      }`}
                    />
                  </Form.Group>
                )}
                
                {userRole === 'EVENT_ORGANIZER' && (
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label">
                      <FaBuilding className="form-icon" /> Company Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="companyName"
                      value={userData.companyName}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('companyName')}
                      required
                      className={`form-control-custom ${
                        touchedFields.companyName ? (validation.companyName.isValid ? 'is-valid' : 'is-invalid') : ''
                      }`}
                    />
                  </Form.Group>
                )}
                
                <div className="text-center mt-4">
                  <Button type="submit" className="update-profile-btn">
                    Update Profile
                  </Button>
                </div>
                
              </Form>
              {error && <Alert variant="danger" className='alerttt'>{error}</Alert>}
              {success && <Alert variant="success" className='alerttt'>{success}</Alert>}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfileSettings;