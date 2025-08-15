import React from 'react';
import AssignmentList from '../../components/assignments/AssignmentList/AssignmentList';
import styles from './Assignments.module.css';

const Assignments = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tareas</h1>
        <p className={styles.description}>
          Gestiona todas tus tareas y entregas
        </p>
      </div>
      
      <div className={styles.content}>
        <AssignmentList />
      </div>
    </div>
  );
};

export default Assignments;
