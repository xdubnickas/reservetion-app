import { createContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import CustomToast from '../components/common/CustomToast';

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    show: false,
    message: '',
    variant: 'success'
  });

  const showToast = useCallback((message, variant = 'success') => {
    setToast({ show: true, message, variant });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <CustomToast
        show={toast.show}
        message={toast.message}
        variant={toast.variant}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
