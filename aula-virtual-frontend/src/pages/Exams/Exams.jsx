import React from 'react';
import ExamList from '../../components/exams/ExamList/ExamList';
import styles from './Exams.module.css';

const Exams = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Exámenes</h1>
        <p className={styles.description}>
          Consulta y participa en tus exámenes
        </p>
      </div>
      
      <div className={styles.content}>
        <ExamList />
      </div>
    </div>
  );
};

export default Exams;
