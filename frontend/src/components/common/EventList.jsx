import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { eventService } from '../../services/eventService';
import { localityService } from '../../services/localityService';
import { eventRatingService } from '../../services/eventRatingService';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import DetailEventModal from './DetailEventModal';
import ImageUpload from './ImageUpload';
import '../../styles/EventList.css';
import { toast } from 'react-toastify';
import DateTimePicker from './DateTimePicker';
import { BsCheck2Circle, BsExclamationTriangle, BsXCircle, BsFilter, BsBarChartFill, BsCalendarCheck, BsClock, BsStarFill, BsStarHalf, BsStar } from 'react-icons/bs';
import { format, parseISO } from 'date-fns';
import { Line } from 'react-chartjs-2';
import PropTypes from 'prop-types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { eventCategories } from '../../utils/categoryData';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState('eventDate'); // Default sort by date
  const [sortDirection, setSortDirection] = useState('asc'); // Default ascending
  const [showModal, setShowModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    maxCapacity: '', 
    price: '0',  // Default to 0 (free)
    eventDate: '',
    startTime: '',
    duration: '60',
    image: null,
    localityId: '',
  });
  const [localities, setLocalities] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [filteredLocalities, setFilteredLocalities] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [formStep, setFormStep] = useState(1);
  const [excludedTimes, setExcludedTimes] = useState([]);
  const [showStatisticsModal, setShowStatisticsModal] = useState(false);
  const [statsEvent, setStatsEvent] = useState(null);
  const [organizerRating, setOrganizerRating] = useState(0);
  const [eventRatings, setEventRatings] = useState({});
  const [eventRatingStats, setEventRatingStats] = useState({});

  const loadEvents = async () => {
    try {
      const eventsData = await eventService.getMyEvents();
      
      // Fetch ratings for each event
      const ratingsPromises = eventsData.map(event => 
        eventRatingService.getEventRating(event.id)
      );
      
      const ratings = await Promise.all(ratingsPromises);
      
      // Create a map of event ID to rating data
      const ratingsMap = {};
      const statsMap = {};
      
      eventsData.forEach((event, index) => {
        // If the response has both average and count
        if (typeof ratings[index] === 'object') {
          ratingsMap[event.id] = ratings[index].average || 0;
          statsMap[event.id] = {
            average: ratings[index].average || 0,
            count: ratings[index].count || 0,
            distribution: {}
          };
        } else {
          // If the response is just the average rating number
          ratingsMap[event.id] = ratings[index] || 0;
        }
      });
      
      setEventRatings(ratingsMap);
      setEventRatingStats(statsMap);
      
      if (eventsData.length > 0 && eventsData[0].eventOrganizer) {
        setOrganizerRating(eventsData[0].eventOrganizer.averageRating || 0);
      }
      
      setEvents(eventsData);
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [eventsData, localitiesData, citiesData] = await Promise.all([
          eventService.getMyEvents(),
          localityService.getAllLocalities(),
          localityService.getAllCities()
        ]);
        
        // Fetch ratings for each event
        const ratingsPromises = eventsData.map(event => 
          eventRatingService.getEventRating(event.id)
        );
        
        const ratings = await Promise.all(ratingsPromises);
        
        // Create a map of event ID to rating data
        const ratingsMap = {};
        const statsMap = {};
        
        eventsData.forEach((event, index) => {
          // If the response has both average and count
          if (typeof ratings[index] === 'object') {
            ratingsMap[event.id] = ratings[index].average || 0;
            statsMap[event.id] = {
              average: ratings[index].average || 0,
              count: ratings[index].count || 0,
              distribution: {}
            };
          } else {
            // If the response is just the average rating number
            ratingsMap[event.id] = ratings[index] || 0;
          }
        });
        
        setEventRatings(ratingsMap);
        setEventRatingStats(statsMap);
        
        if (eventsData.length > 0 && eventsData[0].eventOrganizer) {
          setOrganizerRating(eventsData[0].eventOrganizer.averageRating || 0);
        }
        
        setEvents(eventsData);
        setLocalities(localitiesData);
        
        const cityNames = Array.isArray(citiesData) 
          ? citiesData.map(city => typeof city === 'object' ? city.name : city) 
          : [];
        setCities(cityNames);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCity && localities.length > 0) {
      const filtered = localities.filter(locality => locality.city.name === selectedCity);
      setFilteredLocalities(filtered);
    } else {
      setFilteredLocalities([]);
    }
    if (!currentEvent) {
      setFormData(prev => ({ ...prev, localityId: '' }));
    }
  }, [selectedCity, localities, currentEvent]);

  const getSelectedLocalityCapacity = useCallback((localityId = formData.localityId) => {
    if (!localityId) return null;
    const selectedLocality = filteredLocalities.find(
      loc => loc.id === parseInt(localityId)
    );
    return selectedLocality ? selectedLocality.totalCapacity : null;
  }, [filteredLocalities, formData.localityId]);

  const isCapacityConflict = (localityId) => {
    if (!localityId || !formData.maxCapacity) return false;
    const locality = filteredLocalities.find(loc => loc.id === parseInt(localityId));
    return locality && parseInt(formData.maxCapacity) > locality.totalCapacity;
  };

  const handleLocalityChange = (e) => {
    const newLocalityId = e.target.value;
    
    setSelectedRooms([]);
    setFormData(prev => ({
      ...prev,
      localityId: newLocalityId,
      maxCapacity: ''
    }));
  };

  useEffect(() => {
    if (formData.localityId) {
      const maxxCapacity = getSelectedLocalityCapacity();
      if (maxxCapacity && parseInt(formData.maxCapacity) > maxxCapacity) {
        setFormData(prev => ({
          ...prev,
          maxCapacity: maxxCapacity
        }));
      }
    }
  }, [formData.localityId, formData.maxCapacity, getSelectedLocalityCapacity]);

  const getSelectedRoomsCapacity = () => {
    if (!formData.localityId || !selectedRooms.length) return 0;
    
    const selectedLocality = filteredLocalities.find(
      loc => loc.id === parseInt(formData.localityId)
    );
    
    return selectedRooms.reduce((total, roomId) => {
      const room = selectedLocality?.rooms.find(r => r.id === roomId);
      return total + (room?.capacity || 0);
    }, 0);
  };

  const handleRoomToggle = (roomId) => {
    setSelectedRooms(prev => {
      const newSelection = prev.includes(roomId)
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId];
      
      const maxxCapacity = newSelection.reduce((sum, id) => {
        const selectedLocality = filteredLocalities.find(
          loc => loc.id === parseInt(formData.localityId)
        );
        const room = selectedLocality?.rooms.find(r => r.id === id);
        return sum + (room?.capacity || 0);
      }, 0);

      if (parseInt(formData.maxCapacity) > maxxCapacity) {
        setFormData(prev => ({
          ...prev,
          maxCapacity: maxxCapacity
        }));
      }

      return newSelection;
    });
  };

  const handleEdit = async (event) => {
    if (event.status === 'INACTIVE') {
      toast.warning('Inactive events cannot be edited');
      return;
    }
    
    if (!event || !event.rooms[0].locality) return;
    
    const [hours, minutes] = event.startTime.split(':').map(Number);
    const endDate = new Date();
    endDate.setHours(hours);
    endDate.setMinutes(minutes + event.duration);
    const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

    setCurrentEvent(event);
    setFormData({
      name: event.name || '',
      description: event.description || '',
      category: event.category || '',
      maxCapacity: event.maxCapacity || '',
      price: event.price !== undefined ? event.price.toString() : '0',
      eventDate: event.eventDate || '',
      startTime: event.startTime || '',
      duration: event.duration || '60',
      image: event.imagePath || '',
      localityId: event.rooms[0].locality.id.toString(),
      endTime: endTime
    });
    setFormStep(1); // Reset to first step when editing

    try {
      const allLocalities = await localityService.getAllLocalities();
      setLocalities(allLocalities);
      
      const cityName = event.rooms[0].locality.city.name;
      setSelectedCity(cityName);
      
      const cityLocalities = allLocalities.filter(loc => loc.city.name === cityName);
      setFilteredLocalities(cityLocalities);
      
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          localityId: event.rooms[0].locality.id.toString()
        }));
        
        if (event.rooms && Array.isArray(event.rooms)) {
          setSelectedRooms(event.rooms.map(room => room.id));
        }
      }, 0);
    } catch (error) {
      console.error('Failed to load localities:', error);
      toast.error('Failed to load venue data');
    }
    
    setShowModal(true);
  };

  const isFormValid = () => {
    return selectedRooms.length > 0;
  };

  const isFirstStepValid = () => {
    return formData.name && 
           formData.category && 
           formData.price !== undefined && 
           formData.description &&
           selectedRooms.length > 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error('Please select at least one room');
      return;
    }

    try {
      const eventPayload = {
        name: formData.name,
        description: formData.description || '',
        category: formData.category,
        maxCapacity: parseInt(formData.maxCapacity),
        price: parseFloat(formData.price),
        eventDate: formData.eventDate,
        startTime: formData.startTime,
        duration: parseInt(formData.duration),
        image: formData.image,
        roomIds: selectedRooms,
        localityId: parseInt(formData.localityId)
      };

      if (currentEvent) {
        await eventService.updateEvent(currentEvent.id, eventPayload);
      } else {
        await eventService.createEventWithDetails(eventPayload);
      }
      await loadEvents();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save event:', error);
      toast.error('Failed to save event');
    }
  };

  const handleDelete = (id) => {
    setEventToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await eventService.deleteEvent(eventToDelete);
      loadEvents();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedCity('');
    setFilteredLocalities([]);
    setFormStep(1);
  };

  const loadExcludedTimes = async (selectedRooms, date, excludeEventId = null) => {
    try {
      if (selectedRooms.length > 0 && date) {
        const response = await eventService.getOccupiedTimes(selectedRooms, date, excludeEventId);
        setExcludedTimes(response.data);
      }
    } catch (error) {
      console.error('Failed to load occupied times:', error);
      toast.error('Failed to load occupied times');
    }
  };

  useEffect(() => {
    if (formData.eventDate && selectedRooms.length > 0) {
      const eventIdToExclude = currentEvent ? currentEvent.id : null;
      loadExcludedTimes(selectedRooms, formData.eventDate, eventIdToExclude);
    }
  }, [formData.eventDate, selectedRooms, currentEvent]);

  const handleDateTimeChange = (date, time) => {
    setFormData(prev => ({
      ...prev,
      eventDate: date,
      startTime: time
    }));
    
    if (selectedRooms.length > 0 && date) {
      const eventIdToExclude = currentEvent ? currentEvent.id : null;
      loadExcludedTimes(selectedRooms, date, eventIdToExclude);
    }
  };

  useEffect(() => {
    if (events.length) {
      let filtered = events;
      
      // Apply status filter
      if (statusFilter !== 'ALL') {
        filtered = filtered.filter(event => event.status === statusFilter);
      }
      
      // Apply sorting
      filtered = [...filtered].sort((a, b) => {
        if (sortField === 'name') {
          return sortDirection === 'asc' 
            ? a.name.localeCompare(b.name) 
            : b.name.localeCompare(a.name);
        } else if (sortField === 'eventDate') {
          const dateA = new Date(a.eventDate + 'T' + a.startTime);
          const dateB = new Date(b.eventDate + 'T' + b.startTime);
          return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        }
        return 0;
      });
      
      setFilteredEvents(filtered);
    }
  }, [events, statusFilter, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'ACTIVE': return 'Active';
      case 'FULL': return 'Full';
      case 'INACTIVE': return 'Inactive';
      default: return status || 'Unknown';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'ACTIVE': return <BsCheck2Circle className="status-icon active" />;
      case 'FULL': return <BsExclamationTriangle className="status-icon full" />;
      case 'INACTIVE': return <BsXCircle className="status-icon inactive" />;
      default: return null;
    }
  };

  const renderStarRating = (rating) => {
    if (!rating && rating !== 0) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<BsStarFill key={`full-${i}`} className="rating-star filled" />);
    }
    
    if (hasHalfStar) {
      stars.push(<BsStarHalf key="half" className="rating-star half-filled" />);
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<BsStar key={`empty-${i}`} className="rating-star empty" />);
    }
    
    return (
      <div className="star-rating">
        {stars}
        <span className="rating-value ms-2">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const renderEventStatistics = (event) => {
    // Filter out CANCELLED reservations
    const confirmedReservations = event.reservations ? 
      event.reservations.filter(r => r.status !== "CANCELLED") : 
      [];
    
    const reservationCount = confirmedReservations.length;
    const reservationRate = event.maxCapacity > 0 
      ? (reservationCount / event.maxCapacity) * 100 
      : 0;
    
    const daysUntilEvent = event.eventDate ? 
      Math.ceil((new Date(event.eventDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
    
    // Get rating count from either eventRatingStats or use 0 as default
    const ratingCount = eventRatingStats[event.id]?.count || 0;
    
    // Show initial loading state if we have an average rating but no count data yet
    const hasRating = eventRatings[event.id] > 0;
    
    return (
      <div className="event-statistics">
        <h6 className="statistics-title">Event Metrics</h6>
        <div className="statistics-grid">
          <div className="statistic-item">
            <BsCalendarCheck className="statistic-icon" />
            <div className="statistic-content">
              {event.status === 'INACTIVE' ? (
                <>
                  <div className="statistic-value">Event ended</div>
                  <div className="statistic-label">&nbsp;</div>
                </>
              ) : (
                <>
                  <div className="statistic-value">{daysUntilEvent > 0 ? daysUntilEvent : 'Today!'}</div>
                  <div className="statistic-label">{daysUntilEvent !== 1 ? 'Days Left' : 'Day Left'}</div>
                </>
              )}
            </div>
          </div>
          
          <div className="statistic-item">
            <BsClock className="statistic-icon" />
            <div className="statistic-content">
              <div className="statistic-value">{reservationCount}/{event.maxCapacity}</div>
              <div className="statistic-label">Reservations</div>
            </div>
          </div>
          
          <div className="statistic-item">
            <BsBarChartFill className={`statistic-icon ${reservationRate > 70 ? 'trend-up' : reservationRate > 30 ? 'trend-neutral' : ''}`} />
            <div className="statistic-content">
              <div className="statistic-value">
                {reservationRate.toFixed(1)}%
              </div>
              <div className="statistic-label">Capacity Used</div>
            </div>
          </div>
        </div>
        
        <div className="event-rating mt-2">
          <div className="rating-label">Average Event Rating:</div>
          {renderStarRating(eventRatings[event.id] || 0)}
          <div className="rating-count">
            {hasRating || ratingCount > 0 ? 
              `(${ratingCount} ${ratingCount === 1 ? 'rating' : 'ratings'})` : 
              '(No ratings yet)'}
          </div>
        </div>
        
        <div className="text-center mt-2">
          <Button 
            variant="link" 
            size="sm" 
            className="stats-btn"
            onClick={(e) => {
              e.stopPropagation();
              showStats(event);
            }}
          >
            View Detailed Statistics
          </Button>
        </div>
      </div>
    );
  };

  const renderStatisticsChart = (event) => {
    if (!event || !event.reservations) return null;
    
    // Filter out CANCELLED reservations
    const confirmedReservations = event.reservations.filter(r => r.status !== "CANCELLED");
    
    const sortedReservations = [...confirmedReservations].sort((a, b) => 
      new Date(a.reservationDate) - new Date(b.reservationDate)
    );
    
    const reservationsByDate = sortedReservations.reduce((acc, reservation) => {
      const date = reservation.reservationDate.split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    const dates = Object.keys(reservationsByDate);
    const counts = Object.values(reservationsByDate);
    
    const cumulativeCounts = counts.reduce((acc, count, i) => {
      acc.push((acc[i-1] || 0) + count);
      return acc;
    }, []);
    
    const chartData = {
      labels: dates.map(date => format(parseISO(date), 'MMM d, yyyy')),
      datasets: [
        {
          label: 'Reservations',
          data: cumulativeCounts,
          fill: false,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.1
        }
      ]
    };
    
    const chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Reservation Growth Over Time'
        },
        tooltip: {
          callbacks: {
            label: (context) => `Total Reservations: ${context.raw}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Reservations'
          },
          ticks: {
            stepSize: 1
          }
        },
        x: {
          title: {
            display: true,
            text: 'Date'
          }
        }
      }
    };
    
    return (
      <div className="statistics-chart-container d-flex justify-content-center">
        <Line data={chartData} options={chartOptions} />
      </div>
    );
  };

  const showStats = async (event) => {
    try {
      // Fetch detailed rating statistics including count and distribution
      const stats = await eventRatingService.getEventRatingStats(event.id);
      
      setEventRatingStats(prev => ({
        ...prev,
        [event.id]: stats
      }));
      
      // Update the ratings as well to ensure consistency
      setEventRatings(prev => ({
        ...prev,
        [event.id]: stats.average
      }));
    } catch (error) {
      console.error("Error fetching event rating stats", error);
    }
    
    setStatsEvent(event);
    setShowStatisticsModal(true);
  };

  const RatingDistribution = ({ distribution }) => {
    const totalRatings = Object.values(distribution).reduce((acc, count) => acc + count, 0);
    
    if (!totalRatings) return <p>No ratings yet</p>;
    
    return (
      <div className="rating-distribution">
        {[5, 4, 3, 2, 1].map(star => {
          const count = distribution[star] || 0;
          const percentage = totalRatings ? (count / totalRatings) * 100 : 0;
          
          return (
            <div key={star} className="distribution-row">
              <div className="stars-label">
                {star} {star === 1 ? 'star' : 'stars'}
              </div>
              <div className="progress-container">
                <div 
                  className="progress-bar" 
                  style={{ width: `${percentage}%` }}
                  title={`${count} ${count === 1 ? 'user' : 'users'}`}
                ></div>
              </div>
              <div className="count-label">{count}</div>
            </div>
          );
        })}
      </div>
    );
  };

  RatingDistribution.propTypes = {
    distribution: PropTypes.object.isRequired
  };

  return (
    <div className="event-list">
      <div className="d-flex justify-content-between mb-3">
        <h3>My Events</h3>
          
        <Button
          variant="primary" 
          className="create-event-btn"
          onClick={() => {
            setCurrentEvent(null);
            setFormData({
              name: '',
              description: '',
              category: '',
              maxCapacity: '',
              price: '0',
              eventDate: '',
              startTime: '',
              duration: '60',
              image: null,
              localityId: '',
            });
            setFormStep(1); // Reset to first step when creating new event
            setShowModal(true);
          }}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Create Event
        </Button>
      </div>

      <div className="status-filter-container mb-4">
        <Row>
          <Col md={8}>
            <div className="status-filter">
              <div className="filter-header">
                <BsFilter className="filter-icon" />
                <span>Filter by Status</span>
              </div>
              <div className="filter-options">
                <div 
                  className={`filter-option ${statusFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('ALL')}
                >
                  <span>All</span>
                </div>
                <div 
                  className={`filter-option ${statusFilter === 'ACTIVE' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('ACTIVE')}
                >
                  <BsCheck2Circle />
                  <span>Active</span>
                </div>
                <div 
                  className={`filter-option ${statusFilter === 'FULL' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('FULL')}
                >
                  <BsExclamationTriangle />
                  <span>Full</span>
                </div>
                <div 
                  className={`filter-option ${statusFilter === 'INACTIVE' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('INACTIVE')}
                >
                  <BsXCircle />
                  <span>Inactive</span>
                </div>
              </div>
            </div>
          </Col>
          <Col md={4}>
            <div className="sort-controls">
              <div className="filter-header">
                <BsBarChartFill className="filter-icon" />
                <span>Sort By</span>
              </div>
              <div className="filter-options">
                <div 
                  className={`filter-option ${sortField === 'name' ? 'active' : ''}`}
                  onClick={() => handleSort('name')}
                >
                  <span>Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                </div>
                <div 
                  className={`filter-option ${sortField === 'eventDate' ? 'active' : ''}`}
                  onClick={() => handleSort('eventDate')}
                >
                  <span>Date {sortField === 'eventDate' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <div className="row">
        {filteredEvents.map(event => (
          <div key={event.id} className="col-md-6 mb-3">
            <Card className={`event-card status-${event.status ? event.status.toLowerCase() : 'unknown'}`}>
              <Card.Body>
                <div className="event-card-header">
                  <Card.Title 
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowDetailModal(true);
                    }}
                  >
                    {event.name}
                  </Card.Title>
                  <div className="event-status">
                    {getStatusIcon(event.status)}
                    <span className="status-text">{getStatusText(event.status)}</span>
                  </div>
                </div>
                <Card.Text>
                  <strong>Date & Time:</strong> {event.eventDate} at {event.startTime}<br/>
                  <strong>Category:</strong> {event.category}<br/>
                  <strong>Price:</strong> {parseFloat(event.price) > 0 ? `€${event.price}` : 'Free'}
                </Card.Text>
                
                {renderEventStatistics(event)}
                
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowDetailModal(true);
                    }}
                  >
                    View Details
                  </Button>
                  <div>
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(event)}
                      disabled={event.status === 'INACTIVE'}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(event.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
      
      {/* Add button at the bottom of event list */}
      <div className="add-event-bottom">
        <button 
          className="add-event-btn"
          onClick={() => {
            setCurrentEvent(null);
            setFormData({
              name: '',
              description: '',
              category: '',
              maxCapacity: '',
              price: '0',
              eventDate: '',
              startTime: '',
              duration: '60',
              image: null,
              localityId: '',
            });
            setFormStep(1); // Reset to first step when creating new event
            setShowModal(true);
          }}
          title="Create New Event"
        >
          <i className="bi bi-plus"></i>
        </button>
      </div>

      <Modal 
        show={showModal} 
        onHide={handleModalClose} 
        className="event-modal" 
        size="xl"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>{currentEvent ? 'Edit Event' : 'Create New Event'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {formStep === 1 ? (
              <>
                <div className="row g-4">
                  <div className="col-md-6">
                    <Form.Group className="mb-4">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        className="description-field"
                        rows={8}
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                      />
                    </Form.Group>
                  </div>

                  <div className="col-md-6">
                    <div className="row">
                      <div className="col-6">
                        <Form.Group className="mb-4">
                          <Form.Label>Category</Form.Label>
                          <Form.Select
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            required
                          >
                            <option value="">Select category</option>
                            {eventCategories.map((category, index) => (
                              <option key={index} value={category}>
                                {category}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                      <div className="col-6">
                        <Form.Group className="mb-4">
                          <Form.Label>Price (€) <small className="text-muted">(0 = free)</small></Form.Label>
                          <Form.Control
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                            placeholder="0"
                          />
                        </Form.Group>
                      </div>
                    </div>

                    <Form.Group>
                      <Form.Label>Event Image</Form.Label>
                      <ImageUpload
                        value={formData.image}
                        onChange={(file) => setFormData({...formData, image: file})}
                      />
                    </Form.Group>
                  </div>
                </div>

                <div className="locality-section mt-4">
                  <div className="locality-container">
                    <div className="locality-selects">
                      <Form.Group>
                        <Form.Label>Select City</Form.Label>
                        <Form.Select
                          value={selectedCity}
                          onChange={(e) => setSelectedCity(e.target.value)}
                          required
                        >
                          <option value="">Select city first</option>
                          {cities && cities.map((city, index) => (
                            <option key={`city-${index}`} value={city}>
                              {city}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>

                      {selectedCity && (
                        <Form.Group>
                          <Form.Label>Select Locality in {selectedCity}</Form.Label>
                          <Form.Select
                            value={formData.localityId}
                            onChange={handleLocalityChange}
                            className={isCapacityConflict(formData.localityId) ? 'is-invalid' : ''}
                            required
                          >
                            <option value="">Select locality</option>
                            {filteredLocalities && filteredLocalities.map(locality => (
                              <option 
                                key={locality.id} 
                                value={locality.id}
                                className={parseInt(formData.maxCapacity) > locality.totalCapacity ? 'text-danger' : ''}
                              >
                                {locality.name} - {locality.address} (Max: {locality.totalCapacity})
                              </option>
                            ))}
                          </Form.Select>
                          {isCapacityConflict(formData.localityId) && (
                            <div className="invalid-feedback">
                              Venue capacity ({getSelectedLocalityCapacity()}) is smaller than event capacity ({formData.maxCapacity})
                            </div>
                          )}
                        </Form.Group>
                      )}
                    </div>

                    <div className="locality-field">
                      <div className="placeholder-text">
                        {!selectedCity ? (
                          "Select a city to see available venues"
                        ) : !formData.localityId ? (
                          "Select a venue to see its details"
                        ) : (
                          <div className="locality-details">
                            {filteredLocalities
                              .filter(loc => loc.id === parseInt(formData.localityId))
                              .map(locality => (
                                <div key={locality.id} className="p-3">
                                  <h6 className="mb-3">Selected Locality Details</h6>
                                  <p className="mb-2"><strong>{locality.name}</strong></p>
                                  <p className="mb-2">{locality.address}</p>
                                  <p className="mb-0">Capacity: {locality.totalCapacity}</p>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row mt-4">
                  <div className="col-12 mb-4">
                    <Form.Group>
                      <Form.Label>Select Rooms</Form.Label>
                      <div className="rooms-checkbox-container">
                        {!formData.localityId ? (
                          <div className="no-rooms-message">
                            <i className="bi bi-info-circle me-2"></i>
                            Please select a venue first to see available rooms
                          </div>
                        ) : filteredLocalities.find(loc => loc.id === parseInt(formData.localityId))?.rooms?.length === 0 ? (
                          <div className="no-rooms-message">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            No rooms available in this venue
                          </div>
                        ) : (
                          filteredLocalities.find(loc => loc.id === parseInt(formData.localityId))?.rooms?.map(room => (
                            <Form.Check
                              key={room.id}
                              type="checkbox"
                              id={`room-${room.id}`}
                              label={`${room.name} (Floor: ${room.floor}, Capacity: ${room.capacity})`}
                              checked={selectedRooms.includes(room.id)}
                              onChange={() => handleRoomToggle(room.id)}
                              className="room-checkbox"
                            />
                          ))
                        )}
                      </div>
                      
                      <div className={`capacity-section ${selectedRooms.length > 0 ? 'visible' : ''}`}>
                        <Form.Label>Event Capacity (max: {getSelectedRoomsCapacity()})</Form.Label>
                        <Form.Control
                          type="number"
                          min="1"
                          max={getSelectedRoomsCapacity()}
                          value={formData.maxCapacity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            const maxxCapacity = getSelectedRoomsCapacity();
                            
                            if (value > maxxCapacity) {
                              setFormData(prev => ({
                                ...prev,
                                maxCapacity: maxxCapacity
                              }));
                              toast.warning(`Maximum capacity is ${maxxCapacity}`);
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                maxCapacity: value
                              }));
                            }
                          }}
                          required
                        />
                        <Form.Text className="text-muted">
                          Maximum capacity is based on selected rooms total capacity
                        </Form.Text>
                      </div>
                    </Form.Group>
                  </div>
                </div>
              </>
            ) : (
              <div className="row justify-content-center">
                <div className="col-md-10">
                  <DateTimePicker
                    selectedDate={formData.eventDate}
                    selectedTime={formData.startTime}
                    duration={formData.duration}
                    onDateTimeChange={handleDateTimeChange}
                    onDurationChange={(newDuration) => {
                      setFormData(prev => ({
                        ...prev,
                        duration: newDuration
                      }));
                    }}
                    excludedTimes={excludedTimes}
                  />
                </div>
              </div>
            )}

            <div className="d-flex justify-content-end mt-4 button-container">
              <Button 
                variant="secondary" 
                className="me-3" 
                onClick={handleModalClose}
              >
                Cancel
              </Button>
              
              {formStep === 1 ? (
                <Button 
                  variant="primary"
                  onClick={() => setFormStep(2)}
                  disabled={!isFirstStepValid()}
                >
                  Next
                </Button>
              ) : (
                <>
                  <Button 
                    variant="secondary" 
                    className="me-3"
                    onClick={() => setFormStep(1)}
                  >
                    Back
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={!isFormValid()}
                  >
                    Save
                  </Button>
                </>
              )}
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
      />

      <DetailEventModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        event={selectedEvent}
      />

      <Modal 
        show={showStatisticsModal} 
        onHide={() => setShowStatisticsModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {statsEvent ? `Statistics: ${statsEvent.name}` : 'Event Statistics'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {statsEvent ? (
            <>
              <Row className="mb-4">
                <Col md={3}>
                  <div className="stats-summary-item">
                    <h5>Event Capacity</h5>
                    <div className="stats-value">
                      {statsEvent.maxCapacity}
                    </div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="stats-summary-item">
                    <h5>Reservations</h5>
                    <div className="stats-value">
                      {statsEvent.reservations ? statsEvent.reservations.filter(r => r.status !== "CANCELLED").length : 0}
                    </div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="stats-summary-item">
                    <h5>Fill Rate</h5>
                    <div className="stats-value">
                      {statsEvent.maxCapacity > 0 
                        ? ((statsEvent.reservations ? statsEvent.reservations.filter(r => r.status !== "CANCELLED").length : 0) / statsEvent.maxCapacity * 100).toFixed(1) 
                        : 0}%
                    </div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="stats-summary-item">
                    <h5>Rating</h5>
                    <div className="stats-value">
                      {renderStarRating(eventRatings[statsEvent.id] || 0)}
                    </div>
                  </div>
                </Col>
              </Row>
              
              <h5 className="mb-3">Reservation Growth</h5>
              {statsEvent.reservations && statsEvent.reservations.filter(r => r.status !== "CANCELLED").length > 0 ? (
                renderStatisticsChart(statsEvent)
              ) : (
                <div className="text-center p-5 bg-light rounded">
                  <p className="mb-0">No reservation data available yet</p>
                </div>
              )}
              
              <div className="mt-4"></div>
                <h5 className="mb-3">Rating Details</h5>
                <div className="rating-details p-3 bg-light rounded">
                  <Row>
                    <Col md={4}>
                      <div className="big-rating text-center">
                        {renderStarRating(eventRatings[statsEvent.id] || 0)}
                        <p className="mt-1 mb-0">
                          {eventRatingStats[statsEvent.id]?.count || 0} {(eventRatingStats[statsEvent.id]?.count || 0) === 1 ? 'rating' : 'ratings'}
                        </p>
                      </div>
                    </Col>
                    <Col md={8}>
                      <h6 className="mb-3">Rating Distribution</h6>
                      <RatingDistribution 
                        distribution={eventRatingStats[statsEvent.id]?.distribution || {}}
                      />
                    </Col>
                  </Row>
              </div>
            </>
          ) : (
            <div className="text-center">
              <p>No event data available</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatisticsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EventList;