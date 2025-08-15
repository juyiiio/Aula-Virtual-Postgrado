import React from 'react';
import CourseList from '../../components/courses/CourseList/CourseList';
import styles from './Courses.module.css';

const Courses = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mis Cursos</h1>
        <p className={styles.description}>
          Explora y gestiona todos tus cursos en un solo lugar
        </p>
      </div>
      
      <div className={styles.content}>
        <CourseList />
      </div>
    </div>
  );
};

export default Courses;
