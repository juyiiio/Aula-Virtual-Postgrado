import React from 'react';
import { useParams } from 'react-router-dom';
import CourseDetail from '../../components/courses/CourseDetail/CourseDetail';
import styles from './Courses.module.css';

const CourseDetails = () => {
  const { id } = useParams();

  return (
    <div className={styles.container}>
      <CourseDetail courseId={id} />
    </div>
  );
};

export default CourseDetails;
