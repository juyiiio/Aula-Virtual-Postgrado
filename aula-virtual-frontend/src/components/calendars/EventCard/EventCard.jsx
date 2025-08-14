import React from 'react';
import Card from '../../common/Card/Card';
import { formatTime, formatDateTime } from '../../../utils/dateUtils';
import styles from './EventCard.module.css';

const EventCard = ({ event, compact = false }) => {
  const {
    id,
    title,
    description,
    eventType,
    startDatetime,
    endDatetime,
    location,
    isVirtual,
    meetingUrl,
    course
  } = event;

  const getEventIcon = (type) => {
    switch (type) {
      case 'CLASS': return '📚';
      case 'EXAM': return '📋';
      case 'ASSIGNMENT_DUE': return '📝';
      case 'MEETING': return '🤝';
      default: return '📅';
    }
  };

  const getEventTypeText = (type) => {
    switch (type) {
      case 'CLASS': return 'Clase';
      case 'EXAM': return 'Examen';
      case 'ASSIGNMENT_DUE': return 'Entrega de Tarea';
      case 'MEETING': return 'Reunión';
      default: return 'Evento';
    }
  };

  if (compact) {
    return (
      <div className={`${styles.eventCard} ${styles.compact} ${styles[eventType?.toLowerCase()]}`}>
        <div className={styles.eventHeader}>
          <span className={styles.eventIcon}>{getEventIcon(eventType)}</span>
          <div className={styles.eventInfo}>
            <h4 className={styles.eventTitle}>{title}</h4>
            <p className={styles.eventTime}>
              {formatTime(startDatetime)} - {formatTime(endDatetime)}
            </p>
          </div>
        </div>
        {course && (
          <p className={styles.courseName}>{course.name}</p>
        )}
      </div>
    );
  }

  return (
    <Card className={`${styles.eventCard} ${styles[eventType?.toLowerCase()]}`} hoverable>
      <div className={styles.eventHeader}>
        <div className={styles.eventMeta}>
          <span className={styles.eventIcon}>{getEventIcon(eventType)}</span>
          <span className={styles.eventType}>{getEventTypeText(eventType)}</span>
        </div>
        <div className={styles.eventTime}>
          {formatTime(startDatetime)} - {formatTime(endDatetime)}
        </div>
      </div>

      <div className={styles.eventContent}>
        <h3 className={styles.eventTitle}>{title}</h3>
        {description && (
          <p className={styles.eventDescription}>{description}</p>
        )}

        <div className={styles.eventDetails}>
          {course && (
            <div className={styles.eventDetail}>
              <span className={styles.detailLabel}>Curso:</span>
              <span>{course.name}</span>
            </div>
          )}

          <div className={styles.eventDetail}>
            <span className={styles.detailLabel}>Ubicación:</span>
            <span>
              {isVirtual ? (
                <span className={styles.virtualBadge}>Virtual</span>
              ) : (
                location || 'No especificada'
              )}
            </span>
          </div>

          {isVirtual && meetingUrl && (
            <div className={styles.eventDetail}>
              <span className={styles.detailLabel}>Enlace:</span>
              <a href={meetingUrl} target="_blank" rel="noopener noreferrer" className={styles.meetingLink}>
                Unirse a la reunión
              </a>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default EventCard;
