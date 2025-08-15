import React from 'react';
import { useParams } from 'react-router-dom';
import ExamTaking from '../../components/exams/ExamTaking/ExamTaking';
import styles from './Exams.module.css';

const ExamDetails = () => {
  const { id } = useParams();

  return (
    <div className={styles.container}>
      <ExamTaking examId={id} />
    </div>
  );
};

export default ExamDetails;
