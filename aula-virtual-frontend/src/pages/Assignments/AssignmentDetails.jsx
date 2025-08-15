import React from 'react';
import { useParams } from 'react-router-dom';
import AssignmentSubmission from '../../components/assignments/AssignmentSubmission/AssignmentSubmission';
import styles from './Assignments.module.css';

const AssignmentDetails = () => {
  const { id } = useParams();

  return (
    <div className={styles.container}>
      <AssignmentSubmission assignmentId={id} />
    </div>
  );
};

export default AssignmentDetails;
