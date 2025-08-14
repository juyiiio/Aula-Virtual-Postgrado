import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import { formatStatus } from '../../../utils/formatters';
import styles from './CourseCard.module.css';

const CourseCard = ({ course }) => {
  const {
    id,
    name,
    code,
    description,
    instructor,
    enrolledStudents = 0,
    status,
    startDate,
    endDate
  } = course;

  return (
    <Card className={styles.card} hoverable>
      <div className={styles.header}>
        <div className={styles.courseInfo}>
          <h3 className={styles.courseName}>{name}</h3>
          <p className={styles.courseCode}>{code}</p>
        </div>
        <span className={`${styles.status} ${styles[status?.toLowerCase()]}`}>
          {formatStatus(status)}
        </span>
      </div>

      <div className={styles.content}>
        {description && (
          <p className={styles.description}>{description}</p>
        )}

        {instructor && (
          <div className={styles.instructor}>
            <span className={styles.label}>Instructor:</span>
            <span className={styles.instructorName}>
              {instructor.firstName} {instructor.lastName}
            </span>
          </div>
        )}

        <div className={styles.metadata}>
          <div className={styles.students}>
            <span className={styles.label}>Estudiantes:</span>
            <span>{enrolledStudents}</span>
          </div>

          {startDate && (
            <div className={styles.dates}>
              <span className={styles.label}>Fecha inicio:</span>
              <span>{new Date(startDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.footer}>
        <Link to={`/courses/${id}`}>
          <Button variant="primary" size="small">
            Ver Curso
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default CourseCard;
