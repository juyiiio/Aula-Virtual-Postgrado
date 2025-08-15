import React from 'react';
import ResourceList from '../../components/resources/ResourceList/ResourceList';
import styles from './Resources.module.css';

const Resources = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Recursos Educativos</h1>
        <p className={styles.description}>
          Accede a materiales de apoyo y recursos de aprendizaje
        </p>
      </div>
      
      <div className={styles.content}>
        <ResourceList />
      </div>
    </div>
  );
};

export default Resources;
