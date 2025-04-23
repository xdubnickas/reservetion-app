import { Modal, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

const DeleteConfirmationModal = ({ 
  show, 
  onHide, 
  onConfirm, 
  title = "Delete Confirmation",
  message = "Are you sure you want to delete this item?",
  confirmButtonText = "Delete",
}) => {
  return (
    <Modal show={show} onHide={onHide} centered size="sm">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fs-5">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center py-2">
        <p className="text-secondary mb-0" style={{ fontSize: '0.9rem' }}>
          {message}
        </p>
      </Modal.Body>
      <Modal.Footer className="justify-content-center border-0 pt-2 pb-3">
        <Button 
          variant="secondary" 
          onClick={onHide}
          style={{ borderRadius: '30px' }}
          className="me-2 px-4"

        >
          Cancel
        </Button>
        <Button 
          variant="danger" 
          onClick={onConfirm}
          style={{ borderRadius: '30px' }}
          className="px-4"

        >
          {confirmButtonText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

DeleteConfirmationModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmButtonText: PropTypes.string,
};

export default DeleteConfirmationModal;
