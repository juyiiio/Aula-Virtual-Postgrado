import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import { formatDateTime, isPastDate, isFutureDate } from '../../../utils/dateUtils';
import { formatStatus, formatDuration } from '../../../utils/formatters';
import styles from './ExamCard.module.css';

const ExamCard = ({ exam }) => {
const {
    id,
    title,
    description,
    examType,
    startTime,
    endTime,
    durationMinutes,
    maxPoints,
    status,
    course,
    studentStatus = 'NOT_STARTED'
} = exam;

const isStarted = !isFutureDate(startTime);
const isEnded = isPastDate(endTime);
const canTakeExam = !isEnded && isStarted && studentStatus === 'NOT_STARTED';

return (
    <Card className={styles.card} hoverable>
    <div className={styles.header}>
        <div className={styles.examInfo}>
        <h3 className={styles.examTitle}>{title}</h3>
        <p className={styles.examType}>{examType}</p>
        {course && (
            <p className={styles.courseName}>{course.name}</p>
        )}
        </div>
        <div className={styles.statusContainer}>
        <span className={`${styles.status} ${styles[status?.toLowerCase()]}`}>
            {formatStatus(status)}
        </span>
        {studentStatus !== 'NOT_STARTED' && (
            <span className={`${styles.studentStatus} ${styles[studentStatus?.toLowerCase()]}`}>
            {studentStatus === 'IN_PROGRESS' ? 'En progreso' :
            studentStatus === 'COMPLETED' ? 'Completado' :
            studentStatus === 'GRADED' ? 'Calificado' : studentStatus}
            </span>
        )}
        </div>
    </div>

    <div className={styles.content}>
        {description && (
        <p className={styles.description}>{description}</p>
        )}

        <div className={styles.metadata}>
        <div className={styles.metadataItem}>
            <span className={styles.label}>Fecha de inicio:</span>
            <span className={styles.dateTime}>
            {formatDateTime(startTime)}
            </span>
        </div>

        <div className={styles.metadataItem}>
            <span className={styles.label}>Fecha de fin:</span>
            <span className={styles.dateTime}>
            {formatDateTime(endTime)}
            </span>
        </div>

        <div className={styles.metadataItem}>
            <span className={styles.label}>Duración:</span>
            <span>{formatDuration(durationMinutes)}</span>
        </div>

        <div className={styles.metadataItem}>
            <span className={styles.label}>Puntos máximos:</span>
            <span>{maxPoints || 0}</span>
        </div>
        </div>
    </div>

    <div className={styles.footer}>
        <Link to={`/exams/${id}`}>
        <Button variant="outline" size="small">
            Ver Detalles
        </Button>
        </Link>
        {canTakeExam && (
        <Button variant="primary" size="small">
            Iniciar Examen
        </Button>
        )}
        {studentStatus === 'GRADED' && (
        <Button variant="success" size="small">
            Ver Resultado
        </Button>
        )}
    </div>
    </Card>
);
};

export default ExamCard;
