import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import EventCard from '../EventCard/EventCard';
import Loading from '../../common/Loading/Loading';
import Button from '../../common/Button/Button';
import calendarService from '../../../services/calendarService';
import useAuth from '../../../hooks/useAuth';
import { formatDate, getStartOfMonth, getEndOfMonth } from '../../../utils/dateUtils';
import styles from './Calendar.module.css';

const CalendarComponent = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { hasRole } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, [selectedDate]);

  useEffect(() => {
    filterEventsByDate();
  }, [events, selectedDate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const startDate = getStartOfMonth(selectedDate);
      const endDate = getEndOfMonth(selectedDate);
      
      const eventsData = await calendarService.getEventsByDate(
        startDate.toISOString(),
        endDate.toISOString()
      );
      
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEventsByDate = () => {
    const dateString = formatDate(selectedDate);
    const dayEvents = events.filter(event => {
      const eventDate = formatDate(new Date(event.startDatetime));
      return eventDate === dateString;
    });
    setSelectedDateEvents(dayEvents);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateString = formatDate(date);
      const dayEvents = events.filter(event => {
        const eventDate = formatDate(new Date(event.startDatetime));
        return eventDate === dateString;
      });

      if (dayEvents.length > 0) {
        return (
          <div className={styles.eventDots}>
            {dayEvents.slice(0, 3).map((event, index) => (
              <div
                key={index}
                className={`${styles.eventDot} ${styles[event.eventType?.toLowerCase()]}`}
              />
            ))}
            {dayEvents.length > 3 && (
              <div className={styles.moreEvents}>+{dayEvents.length - 3}</div>
            )}
          </div>
        );
      }
    }
    return null;
  };

  if (loading) {
    return <Loading message="Cargando calendario..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Calendario Académico</h2>
        <div className={styles.actions}>
          {hasRole('INSTRUCTOR') && (
            <Button variant="primary">
              Nuevo Evento
            </Button>
          )}
        </div>
      </div>

      <div className={styles.calendarContainer}>
        <div className={styles.calendar}>
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            tileContent={tileContent}
            className={styles.reactCalendar}
            locale="es-ES"
          />
        </div>

        <div className={styles.sidebar}>
          <div className={styles.selectedDate}>
            <h3>{formatDate(selectedDate)}</h3>
          </div>

          <div className={styles.dayEvents}>
            {selectedDateEvents.length > 0 ? (
              selectedDateEvents.map(event => (
                <EventCard key={event.id} event={event} compact />
              ))
            ) : (
              <p className={styles.noEvents}>No hay eventos para este día</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarComponent;
