import React from 'react';
import ConferenceList from '../../components/videoconference/ConferenceList/ConferenceList';
import styles from './VideoConference.module.css';

const VideoConference = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Videoconferencias</h1>
        <p className={styles.description}>
          Participa en clases virtuales y reuniones
        </p>
      </div>
      
      <div className={styles.content}>
        <ConferenceList />
      </div>
    </div>
  );
};

export default VideoConference;
