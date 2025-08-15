import React from 'react';
import ForumList from '../../components/forums/ForumList/ForumList';
import styles from './Forums.module.css';

const Forums = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Foros de Discusión</h1>
        <p className={styles.description}>
          Participa en discusiones académicas y comparte conocimientos
        </p>
      </div>
      
      <div className={styles.content}>
        <ForumList />
      </div>
    </div>
  );
};

export default Forums;
