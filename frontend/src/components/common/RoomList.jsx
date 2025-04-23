import { useState } from 'react';
import { Button, Table, Modal, Form } from 'react-bootstrap';
import PropTypes from 'prop-types'; // Add this line
import { roomService } from '../../services/roomService';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const RoomList = ({ localityId, rooms, onRoomUpdate, onLocalityUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    floor: '',
    capacity: ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentRoom) {
        await roomService.updateRoom(localityId, currentRoom.id, formData);
      } else {
        await roomService.createRoom(localityId, formData);
      }
      await onRoomUpdate();
      await onLocalityUpdate(); // Add this line
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save room:', error);
    }
  };

  const handleDelete = async (roomId) => {
    setRoomToDelete(roomId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await roomService.deleteRoom(localityId, roomToDelete);
      await onRoomUpdate();
      await onLocalityUpdate(); // Add this line
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete room:', error);
    }
  };

  return (
    <div className="rooms-section">
      <div className="mb-3">
        <Table hover responsive className="rooms-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Floor</th>
              <th>Capacity</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room.id}>
                <td>{room.name}</td>
                <td>{room.floor}</td>
                <td>{room.capacity}</td>
                <td className="text-end">
                  <Button
                    size="sm"
                    variant="link"
                    className="me-2 p-0"
                    onClick={() => {
                      setCurrentRoom(room);
                      setFormData(room);
                      setShowModal(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="link"
                    className="text-danger p-0"
                    onClick={() => handleDelete(room.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Button 
        variant="outline-success"
        size="sm"
        className="add-room-button"
        onClick={() => {
          setCurrentRoom(null);
          setFormData({ name: '', floor: '', capacity: '' });
          setShowModal(true);
        }}
      >
        +
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{currentRoom ? 'Edit Room' : 'Add Room'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Floor</Form.Label>
              <Form.Control
                type="number"
                value={formData.floor}
                onChange={(e) => setFormData({...formData, floor: Number(e.target.value)})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Capacity</Form.Label>
              <Form.Control
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: Number(e.target.value)})}
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Room"
        message="Are you sure you want to delete this room? This action cannot be undone."
      />
    </div>
  );
};

RoomList.propTypes = {
  localityId: PropTypes.number.isRequired,
  rooms: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    floor: PropTypes.number.isRequired,
    capacity: PropTypes.number.isRequired,
  })).isRequired,
  onRoomUpdate: PropTypes.func.isRequired,
  onLocalityUpdate: PropTypes.func.isRequired,
};

export default RoomList;
