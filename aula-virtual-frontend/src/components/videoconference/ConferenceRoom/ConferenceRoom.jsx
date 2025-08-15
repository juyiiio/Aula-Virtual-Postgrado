import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import { formatDateTime, isFutureDate } from '../../../utils/dateUtils';
import { formatDuration } from '../../../utils/formatters';
import styles from './ConferenceCard.module.css';

const ConferenceCard = ({ conference }) => {
  const {
    id,
    title,
    description,
    scheduledTime,
    duration,
    status,
    host,
    course,
    participantsCount = 0,
    meetingUrl
  } = conference;

  const isUpcoming = isFutureDate(scheduledTime);
  const canJoin = status === 'LIVE';

  const handleJoinConference = () => {
    if (meetingUrl) {
      window.open(meetingUrl, '_blank');
    }
  };

  return (
    <Card className={styles.card} hoverable>
      <div className={styles.header}>
        <div className={styles.conferenceInfo}>
          <h3 className={styles.conferenceTitle}>{title}</h3>
          {course && (
            <p className={styles.courseName}>{course.name}</p>
          )}
        </div>
        <span className={`${styles.status} ${styles[status?.toLowerCase()]}`}>
          {status === 'LIVE' ? '🔴 En vivo' : 
           status === 'SCHEDULED' ? '📅 Programada' :
           status === 'ENDED' ? '⏹️ Finalizada' : status}
        </span>
      </div>

      <div className={styles.content}>
        {description && (
          <p className={styles.description}>{description}</p>
        )}

        <div className={styles.metadata}>
          <div className={styles.metadataItem}>
            <span className={styles.label}>Instructor:</span>
            <span>{host?.firstName} {host?.lastName}</span>
          </div>

          <div className={styles.metadataItem}>
            <span className={styles.label}>Fecha y hora:</span>
            <span>{formatDateTime(scheduledTime)}</span>
          </div>

          <div className={styles.metadataItem}>
            <span className={styles.label}>Duración:</span>
            <span>{formatDuration(duration)}</span>
          </div>

          <div className={styles.metadataItem}>
            <span className={styles.label}>Participantes:</span>
            <span>{participantsCount}</span>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <Link to={`/videoconference/${id}`}>
          <Button variant="outline" size="small">
            Ver Detalles
          </Button>
        </Link>
        {canJoin && (
          <Button 
            variant="primary" 
            size="small"
            onClick={handleJoinConference}
          >
            Unirse
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ConferenceCard;
