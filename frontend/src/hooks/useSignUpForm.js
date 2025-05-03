import { useState, useEffect } from 'react';

export const useSignUpForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    companyName: '',
    userType: 'REGISTERED_USER',
    username: '',
  });

  const [touchedFields, setTouchedFields] = useState({
    email: false,
    password: false,
    confirmPassword: false,
    username: false,
    phone: false,
    companyName: false,
    firstName: false,
    lastName: false
  });

  const [validation, setValidation] = useState({
    email: { isValid: false, message: '' },
    password: { isValid: false, message: '' },
    confirmPassword: { isValid: false, message: '' },
    username: { isValid: false, message: '' },
    phone: { isValid: true, message: '' },
    companyName: { isValid: true, message: '' },
    firstName: { isValid: false, message: '' },
    lastName: { isValid: false, message: '' }
  });

  useEffect(() => {
    validateField('email', formData.email);
    validateField('password', formData.password);
    validateField('confirmPassword', formData.confirmPassword);
    validateField('username', formData.username);
    validateField('phone', formData.phone);
    validateField('companyName', formData.companyName);
    validateField('firstName', formData.firstName);
    validateField('lastName', formData.lastName);
  }, [formData]);

  const validateField = (fieldName, value) => {
    let isValid = false;
    let message = '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    // Updated regex to include Slovak characters and diacritical marks
    const nameRegex = /^[\p{L}\s'-]+$/u;

    // Define max lengths for each field
    const maxLengths = {
      email: 100,
      password: 50,
      confirmPassword: 50,
      username: 30,
      phone: 20,
      companyName: 100,
      firstName: 50,
      lastName: 50
    };

    // First check max length
    if (value.length > maxLengths[fieldName]) {
      return setValidation(prev => ({
        ...prev,
        [fieldName]: { 
          isValid: false, 
          message: `Maximum ${maxLengths[fieldName]} characters allowed` 
        }
      }));
    }

    switch (fieldName) {
      case 'email':
        isValid = emailRegex.test(value) && value.length <= maxLengths.email;
        message = isValid ? 'Valid email' : 'Invalid email format';
        break;

      case 'password':
        isValid = value.length >= 5 && value.length <= maxLengths.password;
        message = isValid ? 'Password is valid' : 'Password must be between 5 and 50 characters';
        break;

      case 'confirmPassword':
        isValid = value === formData.password && value !== '';
        message = isValid ? 'Passwords match' : 'Passwords do not match';
        break;

      case 'username':
        isValid = value.length >= 3 && value.length <= maxLengths.username;
        message = isValid ? 'Username is valid' : 'Username must be between 3 and 30 characters';
        break;

      case 'phone':
        isValid = phoneRegex.test(value);
        message = isValid ? 'Valid phone number' : 'Please enter a valid phone number';
        break;

      case 'companyName':
        if (formData.userType === 'EVENT_ORGANIZER') {
          isValid = value.length >= 2 && value.length <= maxLengths.companyName;
          message = isValid ? 'Valid company name' : `Company name must be between 2 and ${maxLengths.companyName} characters`;
        } else {
          isValid = true;
          message = '';
        }
        break;
        
      case 'firstName':
        isValid = nameRegex.test(value) && value.length > 0 && value.length <= maxLengths.firstName;
        message = isValid ? 'Valid name' : 'Name may contain letters (including accents), spaces, hyphens or apostrophes';
        break;
        
      case 'lastName':
        isValid = nameRegex.test(value) && value.length > 0 && value.length <= maxLengths.lastName;
        message = isValid ? 'Valid name' : 'Name may contain letters (including accents), spaces, hyphens or apostrophes';
        break;

      default:
        break;
    }

    setValidation(prev => ({
      ...prev,
      [fieldName]: { isValid, message }
    }));

    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlur = (fieldName) => {
    setTouchedFields(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  const isFormValid = () => {
    // Basic validations for all user types
    const basicFieldsValid = validation.email.isValid && 
                           validation.password.isValid && 
                           validation.confirmPassword.isValid && 
                           validation.username.isValid &&
                           validation.firstName.isValid &&
                           validation.lastName.isValid;

    if (!basicFieldsValid) return false;

    // Additional validations based on user type
    if (formData.userType !== 'REGISTERED_USER') {
      if (!formData.phone || !validation.phone.isValid) {
        return false;
      }
    }

    if (formData.userType === 'EVENT_ORGANIZER') {
      if (!formData.companyName || !validation.companyName.isValid) {
        return false;
      }
    }

    return true;
  };

  return {
    formData,
    validation,
    handleInputChange,
    handleBlur,
    isFormValid,
    touchedFields,
  };
};
