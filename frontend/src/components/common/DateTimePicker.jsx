import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './DateTimePicker.css';

const CustomDateTimePicker = ({ 
  selectedDate,
  selectedTime,
  duration,
  onDateTimeChange,
  onDurationChange,
  excludedTimes = [] // pole obsadených časov vo formáte ["10:00-11:00", "14:00-15:30"]
}) => {
  const [date, setDate] = useState(selectedDate ? new Date(selectedDate) : null);
  const [timeView, setTimeView] = useState(Boolean(selectedTime)); // Ak máme selectedTime, začneme v time view
  const [startTime, setStartTime] = useState(selectedTime || '');

  // Vypočítať endTime pri inicializácii
  const calculateInitialEndTime = () => {
    if (selectedTime && duration) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const endDate = new Date();
      endDate.setHours(hours);
      endDate.setMinutes(minutes + parseInt(duration));
      return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
    }
    return '';
  };

  const [endTime, setEndTime] = useState(calculateInitialEndTime());

  // Enhanced function to check if a time range overlaps with excluded times
  const isTimeRangeOverlapping = (start, end) => {
    
    return excludedTimes.some(excludedTime => {
      let startExcluded, endExcluded;
      
      if (Array.isArray(excludedTime)) {
        [startExcluded, endExcluded] = excludedTime;
      } else if (typeof excludedTime === 'string') {
        [startExcluded, endExcluded] = excludedTime.split('-');
      } else {
        console.warn('Unknown format for excludedTime:', excludedTime);
        return false;
      }
      
      // Remove seconds if present
      startExcluded = formatTimeWithoutSeconds(startExcluded);
      endExcluded = formatTimeWithoutSeconds(endExcluded);
      
      const overlaps = (start < endExcluded && end > startExcluded);
      return overlaps;
    });
  };

  // Updated function to check if a specific time is excluded
  const isTimeExcluded = (timeToCheck) => {
    return excludedTimes.some(excludedTime => {
      let startTime, endTime;
      
      if (Array.isArray(excludedTime)) {
        [startTime, endTime] = excludedTime;
      } else if (typeof excludedTime === 'string') {
        [startTime, endTime] = excludedTime.split('-');
      } else {
        return false;
      }
      
      // Remove seconds if present
      startTime = formatTimeWithoutSeconds(startTime);
      endTime = formatTimeWithoutSeconds(endTime);
      
      return timeToCheck >= startTime && timeToCheck < endTime;
    });
  };

  // Helper function to convert time string to minutes for easier comparison
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Helper function to convert minutes to time string
  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Completely revised function to generate available time options
  const generateTimeOptions = (isStart = true) => {
    const times = [];
    let startHour = 0;
    let endHour = 24;
    
    // If generating end times and we have a start time selected
    if (!isStart && startTime) {
      const startTimeMinutes = timeToMinutes(startTime);
      
      // Generate all possible end times (in 15 min intervals) after the start time
      for (let mins = startTimeMinutes + 15; mins <= 24*60; mins += 15) {
        const potentialEndTime = minutesToTime(mins);
        
        // Check if this start->end range overlaps with any excluded time
        if (!isTimeRangeOverlapping(startTime, potentialEndTime)) {
          times.push(potentialEndTime);
        }
      }
      
      return times;
    }
    
    // If generating start times
    if (isStart) {
      // Generate all possible times in 15 min intervals
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          
          // Skip excluded times
          if (isTimeExcluded(timeString)) {
            continue;
          }
          
          // For each potential start time, check if there's at least one valid end time
          let hasValidEndTime = false;
          
          // Check possible end times (at least 15 mins after start time)
          for (let endMins = timeToMinutes(timeString) + 15; endMins <= 24*60; endMins += 15) {
            const potentialEndTime = minutesToTime(endMins);
            if (!isTimeRangeOverlapping(timeString, potentialEndTime)) {
              hasValidEndTime = true;
              break;
            }
          }
          
          // Only add start times that have at least one valid end time
          if (hasValidEndTime) {
            times.push(timeString);
          }
        }
      }
      
      return times;
    }
    
    return times;
  };

  // Add a utility function to format time by removing seconds
  const formatTimeWithoutSeconds = (timeStr) => {
    if (!timeStr) return '';
    // If time has seconds (HH:MM:SS format), remove the seconds part
    return timeStr.replace(/:\d{2}$/, '');
  };

  const handleDateSelect = (selectedDate) => {
    setDate(selectedDate);
    setTimeView(true);
    
    // Odošleme len dátum (bez času)
    const formattedDate = formatDate(selectedDate);
    onDateTimeChange(formattedDate, null); // Zmeníme na null, aby sme neposielali existujúci čas
  };

  // Modified handleTimeChange to reset end time when start time changes
  const handleTimeChange = (time, isStart = true) => {
    if (isStart) {
      setStartTime(time);
      // Reset end time when start time changes
      setEndTime('');
      
      if (date) {
        const formattedDate = formatDate(date);
        onDateTimeChange(formattedDate, time);
      }
    } else {
      setEndTime(time);
      if (startTime) {
        const durationInMinutes = timeToMinutes(time) - timeToMinutes(startTime);
        onDurationChange?.(durationInMinutes);
      }
    }
  };

  // Pridáme helper funkciu na formátovanie dátumu
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Pridáme novú helper funkciu na formátovanie trvania
  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }
    
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} and ${remainingMinutes} ${remainingMinutes === 1 ? 'minute' : 'minutes'}`;
  };

  const isDayTime = (timeString) => {
    if (!timeString) return true;
    const hour = parseInt(timeString.split(':')[0]);
    return hour >= 6 && hour < 20;
  };

  // Upravená funkcia pre 24-hodinový formát
  const formatTimeDisplay = (timeString) => {
    if (!timeString) return '';
    return timeString; // Vrátime čas v pôvodnom formáte HH:mm
  };

  // Update states when selectedTime changes (for editing)
  useEffect(() => {
    if (selectedTime) {
      setStartTime(selectedTime);
      setTimeView(true);
      
      // Calculate end time
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const endDate = new Date();
      endDate.setHours(hours);
      endDate.setMinutes(minutes + parseInt(duration));
      const newEndTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
      setEndTime(newEndTime);
    }
  }, [selectedTime, duration]);

  // Update states when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setDate(new Date(selectedDate));
    }
  }, [selectedDate]);

  return (
    <div className="datetime-picker-modern">
      {!timeView ? (
        <div className="calendar-view">
          <Calendar
            onChange={handleDateSelect}
            value={date}
            minDate={new Date()}
            className="modern-calendar"
            formatShortWeekday={(locale, date) => 
              ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][date.getDay()]
            }
            nextLabel={<i className="bi bi-chevron-right"></i>}
            prevLabel={<i className="bi bi-chevron-left"></i>}
            next2Label={null}
            prev2Label={null}
          />
        </div>
      ) : (
        <div className="time-picker-view">
          <div className="selected-date">
            <span>
              <i className="bi bi-calendar-event me-2"></i>
              {date.toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <button className="change-date-btn" onClick={() => setTimeView(false)}>
              <i className="bi bi-pencil me-2"></i>
              Change Date
            </button>
          </div>
          
          <div className="time-selectors">
            <div className="time-field">
              <label>Start Time</label>
              <select 
                value={startTime}
                onChange={(e) => handleTimeChange(e.target.value, true)}
                className={`time-select ${isDayTime(startTime) ? 'day-time' : 'night-time'}`}
              >
                <option value="">Select time</option>
                {generateTimeOptions(true).map(time => (
                  <option 
                    key={time} 
                    value={time}
                    className={isDayTime(time) ? 'day-time' : 'night-time'}
                  >
                    {formatTimeDisplay(time)}
                  </option>
                ))}
              </select>
            </div>

            <div className="time-field">
              <label>End Time</label>
              <select
                value={endTime}
                onChange={(e) => handleTimeChange(e.target.value, false)}
                className={`time-select ${isDayTime(endTime) ? 'day-time' : 'night-time'}`}
                disabled={!startTime}
              >
                <option value="">Select time</option>
                {generateTimeOptions(false).map(time => (
                  <option 
                    key={time} 
                    value={time}
                    className={isDayTime(time) ? 'day-time' : 'night-time'}
                  >
                    {formatTimeDisplay(time)}
                  </option>
                ))}
              </select>
              {startTime && !generateTimeOptions(false).length && (
                <div className="text-danger mt-1">
                  <small>No available end times due to scheduling conflicts</small>
                </div>
              )}
            </div>
          </div>

          {/* Zobrazenie obsadených časov */}
          {excludedTimes.length > 0 && (
            <div className="blocked-times">
              <h6>Unavailable Times:</h6>
              <div className="blocked-times-list">
                {excludedTimes.map((timeRange, index) => {
                  let displayText;
                  if (Array.isArray(timeRange)) {
                    // Format both times to remove seconds if present
                    const startTime = formatTimeWithoutSeconds(timeRange[0]);
                    const endTime = formatTimeWithoutSeconds(timeRange[1]);
                    displayText = `${startTime}-${endTime}`;
                  } else {
                    // If it's already a string, split, format each part, and rejoin
                    const [start, end] = timeRange.split('-');
                    if (start && end) {
                      displayText = `${formatTimeWithoutSeconds(start)}-${formatTimeWithoutSeconds(end)}`;
                    } else {
                      displayText = timeRange;
                    }
                  }
                  return (
                    <span key={index} className="blocked-time-badge">
                      {displayText}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Time Summary section */}
          <div className="time-summary">
            <div className="duration">
              {startTime && endTime ? (
                `Duration: ${formatDuration(
                  (parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1])) -
                  (parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]))
                )}`
              ) : (
                <span className="text-muted">Please select start and end time</span>
              )}
            </div>
            <div className="time-range">
              {startTime || '--:--'} - {endTime || '--:--'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

CustomDateTimePicker.propTypes = {
  selectedDate: PropTypes.string,
  selectedTime: PropTypes.string,
  duration: PropTypes.number,
  onDateTimeChange: PropTypes.func.isRequired,
  onDurationChange: PropTypes.func,
  excludedTimes: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]))
};

export default CustomDateTimePicker;
