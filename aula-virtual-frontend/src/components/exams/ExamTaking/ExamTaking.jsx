import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import Loading from '../../common/Loading/Loading';
import examService from '../../../services/examService';
import useNotification from '../../../hooks/useNotification';
import { formatTime } from '../../../utils/dateUtils';
import styles from './ExamTaking.module.css';

const ExamTaking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [examStatus, setExamStatus] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { showError, showSuccess, showWarning } = useNotification();

  useEffect(() => {
    fetchExamData();
  }, [id]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const fetchExamData = async () => {
    try {
      setLoading(true);
      const [examData, statusData] = await Promise.all([
        examService.getExamById(id),
        examService.getExamStatus(id, 'current-user')
      ]);

      setExam(examData);
      setExamStatus(statusData);

      if (statusData.status === 'NOT_STARTED') {
        // Iniciar el examen automáticamente
        await examService.startExam(id);
        const newStatus = await examService.getExamStatus(id, 'current-user');
        setExamStatus(newStatus);
        setTimeRemaining(examData.durationMinutes * 60);
      } else if (statusData.status === 'IN_PROGRESS') {
        // Calcular tiempo restante
        const startTime = new Date(statusData.startTime);
        const now = new Date();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        const totalSeconds = examData.durationMinutes * 60;
        const remaining = Math.max(0, totalSeconds - elapsedSeconds);
        setTimeRemaining(remaining);
      } else if (statusData.status === 'COMPLETED' || statusData.status === 'GRADED') {
        navigate(`/exams/${id}/results`);
        return;
      }
    } catch (error) {
      console.error('Error fetching exam data:', error);
      showError('Error al cargar el examen');
      navigate('/exams');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    if (!window.confirm('¿Estás seguro de enviar el examen? No podrás modificar tus respuestas después.')) {
      return;
    }

    setSubmitting(true);
    try {
      await examService.finishExam(id, answers);
      showSuccess('Examen enviado exitosamente');
      navigate(`/exams/${id}/results`);
    } catch (error) {
      const message = error?.response?.data?.message || 'Error al enviar el examen';
      showError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = async () => {
    showWarning('Tiempo agotado. El examen se enviará automáticamente.');
    try {
      await examService.finishExam(id, answers);
      navigate(`/exams/${id}/results`);
    } catch (error) {
      console.error('Error in auto-submit:', error);
    }
  };

  const formatTimeRemaining = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  };

  if (loading) {
    return <Loading message="Cargando examen..." />;
  }

  if (!exam) {
    return (
      <div className={styles.error}>
        <p>Examen no encontrado</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.examInfo}>
          <h1 className={styles.examTitle}>{exam.title}</h1>
          <p className={styles.examType}>{exam.examType}</p>
        </div>
        
        <div className={styles.timeInfo}>
          <div className={`${styles.timer} ${timeRemaining < 300 ? styles.warning : ''}`}>
            <span className={styles.timeLabel}>Tiempo restante:</span>
            <span className={styles.timeValue}>{formatTimeRemaining(timeRemaining)}</span>
          </div>
        </div>
      </div>

      <Card className={styles.instructionsCard}>
        <h3>Instrucciones</h3>
        <div className={styles.instructions}>
          {exam.instructions ? (
            <p>{exam.instructions}</p>
          ) : (
            <p>Lee cuidadosamente cada pregunta y selecciona la respuesta correcta.</p>
          )}
          <ul>
            <li>Tienes {exam.durationMinutes} minutos para completar el examen</li>
            <li>Una vez enviado, no podrás modificar tus respuestas</li>
            <li>El examen se enviará automáticamente cuando se agote el tiempo</li>
            <li>Puntuación máxima: {exam.maxPoints} puntos</li>
          </ul>
        </div>
      </Card>

      <div className={styles.questionsContainer}>
        {/* Aquí irían las preguntas del examen */}
        <Card className={styles.questionCard}>
          <div className={styles.placeholder}>
            <h3>Preguntas del Examen</h3>
            <p>Las preguntas del examen aparecerán aquí una vez que se implemente el sistema de preguntas.</p>
            <p>Por ahora, este es un componente de demostración del interfaz de toma de exámenes.</p>
          </div>
        </Card>
      </div>

      <div className={styles.footer}>
        <div className={styles.progress}>
          <span>Progreso: 0 de 0 preguntas respondidas</span>
        </div>
        
        <div className={styles.actions}>
          <Button
            variant="outline"
            onClick={() => navigate('/exams')}
            disabled={submitting}
          >
            Cancelar
          </Button>
          
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={submitting}
          >
            Enviar Examen
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExamTaking;
