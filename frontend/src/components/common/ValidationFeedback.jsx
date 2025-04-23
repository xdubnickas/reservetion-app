import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import PropTypes from 'prop-types';

const ValidationFeedback = ({ validation, showValidation, hidden }) => {
  if (!validation) return null;

  return (
    <div className={`validation-feedback ${showValidation ? 'show' : ''} ${validation.isValid ? 'valid' : 'invalid'} ${hidden ? 'hidden' : ''}`}>
      {validation.isValid ? (
        <FaCheckCircle className="validation-icon valid" />
      ) : (
        <FaTimesCircle className="validation-icon invalid" />
      )}
      <small>{validation.message}</small>
    </div>
  );
};

ValidationFeedback.propTypes = {
  validation: PropTypes.shape({
    isValid: PropTypes.bool.isRequired,
    message: PropTypes.string.isRequired,
  }).isRequired,
  showValidation: PropTypes.bool.isRequired,
  hidden: PropTypes.bool,
};

export default ValidationFeedback;
