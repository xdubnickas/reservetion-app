import { useState, useEffect } from "react";
import PropTypes from "prop-types"; // Add this line
import { authenticatedRequest } from "../services/authService";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const RoomAvailability = ({ roomId }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    
    useEffect(() => {
        if (roomId && selectedDate) {
            fetchRoomAvailability();
        }
    }, [roomId, selectedDate]);

    const fetchRoomAvailability = async () => {
        try {
            const formattedDate = selectedDate.toISOString().split("T")[0]; // YYYY-MM-DD
            const response = await authenticatedRequest(
                "GET",
                true,
                `http://localhost:8080/events/room/${roomId}/availability?date=${formattedDate}`
            );
            setEvents(response.data);
        } catch (error) {
            console.error("Chyba pri načítaní dostupnosti miestnosti:", error);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Dostupnosť miestnosti</h2>
            <DatePicker 
                selected={selectedDate} 
                onChange={(date) => setSelectedDate(date)} 
                dateFormat="yyyy-MM-dd"
                className="p-2 border rounded"
            />

            <div className="mt-4">
                {events.length > 0 ? (
                    <ul className="list-disc pl-5">
                        {events.map((event) => (
                            <li key={event.id} className="text-red-500">
                                {event.startTime} - {event.endTime} (obsadené)
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-green-500">Žiadne rezervácie pre tento deň.</p>
                )}
            </div>
        </div>
    );
};

RoomAvailability.propTypes = {
    roomId: PropTypes.string.isRequired, // Add this line
};

export default RoomAvailability;
