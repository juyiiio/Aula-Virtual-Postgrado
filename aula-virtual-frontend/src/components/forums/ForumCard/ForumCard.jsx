import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import { formatDateTime } from '../../../utils/dateUtils';
import { formatStatus } from '../../../utils/formatters';
import styles from './ForumCard.module.css';

const ForumCard = ({ forum }) => {
  const {
    id,
    title,
    description,
    forumType,
    status,
    course,
    createdBy,
    createdAt,
    postsCount = 0,
    lastActivity
  } = forum;

  return (
    <Card className={styles.card} hoverable>
      <div className={styles.header}>
        <div className={styles.forumInfo}>
          <h3 className={styles.forumTitle}>{title}</h3>
          <p className={styles.forumType}>{forumType}</p>
          {course && (
            <p className={styles.courseName}>{course.name}</p>
          )}
        </div>
        <span className={`${styles.status} ${styles[status?.toLowerCase()]}`}>
          {formatStatus(status)}
        </span>
      </div>

      <div className={styles.content}>
        {description && (
          <p className={styles.description}>{description}</p>
        )}

        <div className={styles.metadata}>
          <div className={styles.metadataItem}>
            <span className={styles.label}>Creado por:</span>
            <span>{createdBy?.firstName} {createdBy?.lastName}</span>
          </div>

          <div className={styles.metadataItem}>
            <span className={styles.label}>Fecha de creación:</span>
            <span>{formatDateTime(createdAt)}</span>
          </div>

          <div className={styles.metadataItem}>
            <span className={styles.label}>Posts:</span>
            <span>{postsCount}</span>
          </div>

          {lastActivity && (
            <div className={styles.metadataItem}>
              <span className={styles.label}>Última actividad:</span>
              <span>{formatDateTime(lastActivity)}</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.footer}>
        <Link to={`/forums/${id}`}>
          <Button variant="primary" size="small">
            Ver Foro
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default ForumCard;
