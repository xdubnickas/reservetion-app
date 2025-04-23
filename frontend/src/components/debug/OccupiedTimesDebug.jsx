// import React, { useState } from 'react';
// import { eventService } from '../../services/eventService';
// import { Form, Button, Container, Row, Col, Card, ListGroup } from 'react-bootstrap';

// const OccupiedTimesDebug = () => {
//   const [roomIds, setRoomIds] = useState('');
//   const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
//   const [excludeEventId, setExcludeEventId] = useState('');
//   const [occupiedTimes, setOccupiedTimes] = useState([]);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleRoomIdsChange = (e) => {
//     setRoomIds(e.target.value);
//   };

//   const handleDateChange = (e) => {
//     setDate(e.target.value);
//   };

//   const handleExcludeEventIdChange = (e) => {
//     setExcludeEventId(e.target.value);
//   };

//   const handleFetchOccupiedTimes = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       const roomIdsArray = roomIds.split(',').map(id => parseInt(id.trim()));
//       console.log('Fetching occupied times with:', {
//         roomIdsArray,
//         date,
//         excludeEventId: excludeEventId ? parseInt(excludeEventId) : null
//       });

//       const response = await eventService.getOccupiedTimes(
//         roomIdsArray,
//         date,
//         excludeEventId ? parseInt(excludeEventId) : null
//       );

//       setOccupiedTimes(response.data);
//     } catch (err) {
//       console.error('Error fetching occupied times:', err);
//       setError(err.message || 'Failed to fetch occupied times');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatTime = (time) => {
//     if (!time) return '';
//     return time.replace(/:\d{2}$/, ''); // Remove seconds
//   };

//   return (
//     <Container className="mt-4">
//       <h2 className="mb-4">Debug Occupied Times</h2>
//       <Card>
//         <Card.Body>
//           <Form onSubmit={handleFetchOccupiedTimes}>
//             <Form.Group className="mb-3">
//               <Form.Label>Room IDs (comma-separated):</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={roomIds}
//                 onChange={handleRoomIdsChange}
//                 placeholder="e.g. 1,2,3"
//               />
//               <Form.Text>Enter room IDs separated by commas</Form.Text>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Date:</Form.Label>
//               <Form.Control
//                 type="date"
//                 value={date}
//                 onChange={handleDateChange}
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Exclude Event ID (optional):</Form.Label>
//               <Form.Control
//                 type="number"
//                 value={excludeEventId}
//                 onChange={handleExcludeEventIdChange}
//                 placeholder="Event ID to exclude"
//               />
//               <Form.Text>Enter the ID of an event to exclude from results</Form.Text>
//             </Form.Group>

//             <Button type="submit" variant="primary" disabled={loading}>
//               {loading ? 'Loading...' : 'Fetch Occupied Times'}
//             </Button>
//           </Form>

//           {error && (
//             <div className="alert alert-danger mt-3">
//               {error}
//             </div>
//           )}

//           <Row className="mt-4">
//             <Col>
//               <h4>Results:</h4>
//               {occupiedTimes.length > 0 ? (
//                 <ListGroup>
//                   {occupiedTimes.map((timeSlot, index) => (
//                     <ListGroup.Item key={index}>
//                       {formatTime(timeSlot[0])} - {formatTime(timeSlot[1])}
//                     </ListGroup.Item>
//                   ))}
//                 </ListGroup>
//               ) : (
//                 <p>No occupied times found or no query executed yet.</p>
//               )}
//             </Col>
//           </Row>
//         </Card.Body>
//       </Card>
//     </Container>
//   );
// };

// export default OccupiedTimesDebug;
