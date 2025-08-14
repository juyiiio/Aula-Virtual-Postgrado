import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import { formatDateTime, isPastDate } from '../../../utils/dateUtils';
import { formatStatus } from '../../../utils/formatters';
import styles from './AssignmentCard.module.css';

const AssignmentCard = ({ assignment }) => {
  const {
    id,
    title,
    description,
    dueDate,
    maxPoints,
    status,
    submissionType,
    course,
    submitted = false
  } = assignment;

  const isOverdue = isPastDate(dueDate);
  const isSubmitted = submitted;

  return (
    <Card className={styles.card} hoverable>
      <div className={styles.header}>
        <div className={styles.assignmentInfo}>
          <h3 className={styles.assignmentTitle}>{title}</h3>
          {course && (
            <p className={styles.courseName}>{course.name}</p>
          )}
        </div>
        <div className={styles.statusContainer}>
          <span className={`${styles.status} ${styles[status?.toLowerCase()]}`}>
            {formatStatus(status)}
          </span>
          {isSubmitted && (
            <span className={styles.submittedBadge}>Entregado</span>
          )}
        </div>
      </div>

      <div className={styles.content}>
        {description && (
          <p className={styles.description}>{description}</p>
        )}

        <div className={styles.metadata}>
          <div className={styles.metadataItem}>
            <span className={styles.label}>Fecha límite:</span>
            <span className={`${styles.dueDate} ${isOverdue ? styles.overdue : ''}`}>
              {formatDateTime(dueDate)}
            </span>
          </div>

          <div className={styles.metadataItem}>
            <span className={styles.label}>Puntos máximos:</span>
            <span>{maxPoints || 0}</span>
          </div>

          <div className={styles.metadataItem}>
            <span className={styles.label}>Tipo de entrega:</span>
            <span>{submissionType}</span>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <Link to={`/assignments/${id}`}>
          <Button variant="primary" size="small">
            Ver Detalles
          </Button>
        </Link>
        {!isSubmitted && !isOverdue && (
          <Button variant="success" size="small">
            Entregar
          </Button>
        )}
      </div>
    </Card>
  );
};

export default AssignmentCard;
