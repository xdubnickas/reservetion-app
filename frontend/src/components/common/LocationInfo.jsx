import { Card } from 'react-bootstrap';
import PropTypes from 'prop-types';

const LocationInfo = ({ locality }) => (
  <Card className="location-card">
    <Card.Body>
      <h6 className="location-name">{locality.name}</h6>
      <p className="location-address mb-1">{locality.address}</p>
      <p className="location-city mb-0">{locality.city.name}</p>
    </Card.Body>
  </Card>
);

LocationInfo.propTypes = {
  locality: PropTypes.shape({
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    city: PropTypes.string.isRequired
  }).isRequired
};

export default LocationInfo;
