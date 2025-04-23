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
    companyName: false
  });

  const [validation, setValidation] = useState({
    email: { isValid: false, message: '' },
    password: { isValid: false, message: '' },
    confirmPassword: { isValid: false, message: '' },
    username: { isValid: false, message: '' },
    phone: { isValid: true, message: '' },
    companyName: { isValid: true, message: '' }
  });

  useEffect(() => {
    validateField('email', formData.email);
    validateField('password', formData.password);
    validateField('confirmPassword', formData.confirmPassword);
    validateField('username', formData.username);
    validateField('phone', formData.phone);
    validateField('companyName', formData.companyName);
  }, [formData]);

  const validateField = (fieldName, value) => {
    let isValid = false;
    let message = '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

    switch (fieldName) {
      case 'email':
        isValid = emailRegex.test(value);
        message = isValid ? 'Valid email' : 'Invalid email format';
        break;

      case 'password':
        isValid = value.length >= 5;
        message = isValid ? 'Password is valid' : 'Password must be at least 5 characters';
        break;

      case 'confirmPassword':
        isValid = value === formData.password && value !== '';
        message = isValid ? 'Passwords match' : 'Passwords do not match';
        break;

      case 'username':
        isValid = value.length >= 3;
        message = isValid ? 'Username is valid' : 'Username must be at least 3 characters';
        break;

      case 'phone':
        isValid = phoneRegex.test(value);
        message = isValid ? 'Valid phone number' : 'Please enter a valid phone number';
        break;

      case 'companyName':
        if (formData.userType === 'EVENT_ORGANIZER') {
          isValid = value.length >= 2;
          message = isValid ? 'Valid company name' : 'Company name is required';
        } else {
          isValid = true;
          message = '';
        }
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
                           validation.username.isValid;

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
