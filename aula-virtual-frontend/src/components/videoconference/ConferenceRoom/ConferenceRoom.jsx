import React, { useState, useEffect } from 'react';
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import Loading from '../../common/Loading/Loading';
import useAuth from '../../../hooks/useAuth';
import useNotification from '../../../hooks/useNotification';
import { formatDateTime } from '../../../utils/dateUtils';
import styles from './ConferenceRoom.module.css';

const ConferenceRoom = ({ conferenceId }) => {
  const [conference, setConference] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showError, showSuccess } = useNotification();

  useEffect(() => {
    fetchConferenceData();
  }, [conferenceId]);

  const fetchConferenceData = async () => {
    try {
      setLoading(true);
      // Simular carga de datos de conferencia
      const mockConference = {
        id: conferenceId,
        title: 'Clase Virtual - Matemáticas Avanzadas',
        description: 'Sesión de repaso para el examen final',
        scheduledTime: new Date().toISOString(),
        duration: 90,
        host: {
          firstName: 'Dr. Juan',
          lastName: 'Pérez'
        },
        status: 'LIVE',
        meetingUrl: 'https://zoom.us/j/123456789',
        recordingEnabled: true
      };
      
      setConference(mockConference);
    } catch (error) {
      console.error('Error fetching conference:', error);
      showError('Error al cargar la conferencia');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinConference = () => {
    if (conference?.meetingUrl) {
      window.open(conference.meetingUrl, '_blank');
      setIsJoined(true);
      showSuccess('Uniéndose a la conferencia...');
    }
  };

  const handleLeaveConference = () => {
    setIsJoined(false);
    showSuccess('Has salido de la conferencia');
  };

  if (loading) {
    return <Loading message="Cargando conferencia..." />;
  }

  if (!conference) {
    return (
      <div className={styles.error}>
        <p>Conferencia no encontrada</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Card className={styles.conferenceCard}>
        <div className={styles.header}>
          <div className={styles.conferenceInfo}>
            <h2 className={styles.title}>{conference.title}</h2>
            <p className={styles.description}>{conference.description}</p>
            <div className={styles.metadata}>
              <span className={styles.host}>
                Instructor: {conference.host.firstName} {conference.host.lastName}
              </span>
              <span className={styles.time}>
                {formatDateTime(conference.scheduledTime)}
              </span>
              <span className={styles.duration}>
                Duración: {conference.duration} minutos
              </span>
            </div>
          </div>
          
          <div className={styles.statusBadge}>
            <span className={`${styles.status} ${styles[conference.status?.toLowerCase()]}`}>
              {conference.status === 'LIVE' ? '🔴 En vivo' : 
               conference.status === 'SCHEDULED' ? '📅 Programada' :
               conference.status === 'ENDED' ? '⏹️ Finalizada' : conference.status}
            </span>
          </div>
        </div>

        <div className={styles.controls}>
          {conference.status === 'LIVE' && !isJoined && (
            <Button
              variant="primary"
              size="large"
              onClick={handleJoinConference}
              className={styles.joinButton}
            >
              🎥 Unirse a la Conferencia
            </Button>
          )}
          
          {isJoined && (
            <Button
              variant="error"
              size="large"
              onClick={handleLeaveConference}
              className={styles.leaveButton}
            >
              📤 Salir de la Conferencia
            </Button>
          )}
          
          {conference.status === 'SCHEDULED' && (
            <div className={styles.scheduledMessage}>
              <p>La conferencia comenzará pronto</p>
            </div>
          )}
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🎤</span>
            <span>Audio</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>📹</span>
            <span>Video</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>💬</span>
            <span>Chat</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🖥️</span>
            <span>Compartir Pantalla</span>
          </div>
          {conference.recordingEnabled && (
            <div className={styles.feature}>
              <span className={styles.featureIcon}>⏺️</span>
              <span>Grabación</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ConferenceRoom;
