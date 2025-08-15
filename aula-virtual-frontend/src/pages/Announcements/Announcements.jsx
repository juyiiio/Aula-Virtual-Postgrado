import React from 'react';
import AnnouncementList from '../../components/announcements/AnnouncementList/AnnouncementList';
import styles from './Announcements.module.css';

const Announcements = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Anuncios</h1>
        <p className={styles.description}>
          Mantente informado con las últimas noticias y comunicados
        </p>
      </div>
      
      <div className={styles.content}>
        <AnnouncementList />
      </div>
    </div>
  );
};

export default Announcements;
