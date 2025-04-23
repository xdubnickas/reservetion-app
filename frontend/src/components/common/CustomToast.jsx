import { Toast } from 'react-bootstrap';
import PropTypes from 'prop-types';

const CustomToast = ({ show, message, variant = 'success', onClose }) => {
  return (
    <Toast
      show={show}
      onClose={onClose}
      delay={3500}
      autohide
      className="position-fixed start-50 translate-middle-x notification-toast"
      style={{ top: '50px' }}
      bg={variant}
    >
      <Toast.Header closeButton={false}>
        <strong className="me-auto">
          {variant === 'success' ? '✅ Success' : '❌ Error'}
        </strong>
        <button
          type="button"
          className="btn-close btn-close-white"
          onClick={onClose}
        />
      </Toast.Header>
      <Toast.Body>{message}</Toast.Body>
    </Toast>
  );
};

CustomToast.propTypes = {
  show: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  variant: PropTypes.string,
  onClose: PropTypes.func.isRequired
};

export default CustomToast;
