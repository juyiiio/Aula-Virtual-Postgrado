import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../common/Button/Button';
import Card from '../../common/Card/Card';
import Loading from '../../common/Loading/Loading';
import Modal from '../../common/Modal/Modal';
import { 
  FaClock, 
  FaQuestionCircle, 
  FaCheck, 
  FaArrowLeft, 
  FaArrowRight, 
  FaFlag, 
  FaExclamationTriangle,
  FaSave,
  FaPaperPlane
} from 'react-icons/fa';
import { examService } from '../../../services/examService';
import { toast } from 'react-toastify';
import styles from './ExamTaking.module.css';

const ExamTaking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const timerRef = useRef(null);
  const autoSaveRef = useRef(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [examStartTime, setExamStartTime] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examAttempt, setExamAttempt] = useState(null);

  // Fetch exam details
  const { data: exam, isLoading: examLoading } = useQuery(
    ['exam', id],
    () => examService.getExamById(id),
    {
      onError: (error) => {
        toast.error('Error al cargar el examen');
        navigate('/exams');
      }
    }
  );

  // Start or resume exam attempt
  const startExamMutation = useMutation(
    () => examService.startExamAttempt(id),
    {
      onSuccess: (data) => {
        setExamAttempt(data);
        setExamStartTime(new Date(data.startedAt));
        setAnswers(data.answers || {});
        setFlaggedQuestions(new Set(data.flaggedQuestions || []));
        
        // Calculate time remaining
        const elapsed = (new Date() - new Date(data.startedAt)) / 1000 / 60; // minutes
        const remaining = Math.max(0, exam.duration - elapsed);
        setTimeRemaining(remaining * 60); // convert to seconds
      },
      onError: (error) => {
        toast.error('Error al iniciar el examen');
        navigate('/exams');
      }
    }
  );

  // Auto-save answers
  const autoSaveMutation = useMutation(
    (answersData) => examService.saveExamAnswers(examAttempt?.id, answersData),
    {
      onError: (error) => {
        console.error('Auto-save failed:', error);
      }
    }
  );

  // Submit exam
  const submitExamMutation = useMutation(
    () => examService.submitExamAttempt(examAttempt?.id, {
      answers,
      flaggedQuestions: Array.from(flaggedQuestions),
      timeSpent: exam.duration - (timeRemaining / 60)
    }),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['exams']);
        toast.success('Examen entregado exitosamente');
        navigate(`/exams/${id}/results`);
      },
      onError: (error) => {
        toast.error('Error al entregar el examen');
      }
    }
  );

  // Initialize exam on component mount
  useEffect(() => {
    if (exam && !examAttempt && !examLoading) {
      // Check if exam is available
      const now = new Date();
      const startTime = new Date(exam.startTime);
      const endTime = new Date(exam.endTime);
      
      if (now < startTime) {
        toast.error('El examen aún no ha comenzado');
        navigate('/exams');
        return;
      }
      
      if (now > endTime) {
        toast.error('El examen ha terminado');
        navigate('/exams');
        return;
      }
      
      // Check if student already has an attempt
      const existingAttempt = exam.attempts?.find(att => att.studentId === user?.id);
      if (existingAttempt && existingAttempt.submittedAt) {
        toast.info('Ya has completado este examen');
        navigate(`/exams/${id}/results`);
        return;
      }
      
      startExamMutation.mutate();
    }
  }, [exam, examAttempt, examLoading]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeRemaining]);

  // Auto-save effect
  useEffect(() => {
    if (examAttempt && Object.keys(answers).length > 0) {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
      
      autoSaveRef.current = setTimeout(() => {
        autoSaveMutation.mutate({
          answers,
          flaggedQuestions: Array.from(flaggedQuestions)
        });
      }, 5000); // Auto-save every 5 seconds after changes
    }

    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
    };
  }, [answers, flaggedQuestions, examAttempt]);

  // Prevent leaving page
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (examAttempt && !examAttempt.submittedAt) {
        e.preventDefault();
        e.returnValue = 'Tienes un examen en progreso. ¿Estás seguro de que quieres salir?';
        return e.returnValue;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && examAttempt && !examAttempt.submittedAt) {
        setWarningCount(prev => prev + 1);
        if (warningCount >= 2) {
          setShowWarningModal(true);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [examAttempt, warningCount]);

  const handleAnswerChange = (questionId, selectedAnswers) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedAnswers
    }));
  };

  const handleFlagQuestion = (questionId) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleAutoSubmit = () => {
    if (examAttempt && !examAttempt.submittedAt) {
      toast.warning('Tiempo agotado. Entregando examen automáticamente...');
      submitExamMutation.mutate();
    }
  };

  const handleSubmitExam = () => {
    setShowSubmitModal(true);
  };

  const confirmSubmit = () => {
    setIsSubmitting(true);
    submitExamMutation.mutate();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (questionId) => {
    if (answers[questionId] && answers[questionId].length > 0) {
      return 'answered';
    }
    if (flaggedQuestions.has(questionId)) {
      return 'flagged';
    }
    return 'unanswered';
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).filter(qId => 
      answers[qId] && answers[qId].length > 0
    ).length;
  };

  if (examLoading || startExamMutation.isLoading) {
    return <Loading text="Cargando examen..." />;
  }

  if (!exam || !examAttempt) {
    return (
      <div className={styles.notFound}>
        <h2>Examen no disponible</h2>
        <p>No se pudo cargar el examen o no tienes permisos para acceder.</p>
        <Button variant="primary" onClick={() => navigate('/exams')}>
          Volver a Exámenes
        </Button>
      </div>
    );
  }

  const questions = exam.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.examInfo}>
          <h1 className={styles.examTitle}>{exam.title}</h1>
          <p className={styles.courseName}>{exam.course?.name}</p>
        </div>
        
        <div className={styles.examStats}>
          <div className={styles.statItem}>
            <FaClock className={styles.statIcon} />
            <span className={`${styles.timeRemaining} ${timeRemaining < 300 ? styles.timeWarning : ''}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
          
          <div className={styles.statItem}>
            <FaQuestionCircle className={styles.statIcon} />
            <span>
              {getAnsweredCount()}/{questions.length} respondidas
            </span>
          </div>
        </div>
      </div>

      <div className={styles.examBody}>
        <div className={styles.questionNavigation}>
          <h3>Navegación de Preguntas</h3>
          <div className={styles.questionGrid}>
            {questions.map((question, index) => {
              const status = getQuestionStatus(question.id);
              return (
                <button
                  key={question.id}
                  className={`${styles.questionNavButton} ${styles[status]} ${
                    index === currentQuestionIndex ? styles.current : ''
                  }`}
                  onClick={() => setCurrentQuestionIndex(index)}
                >
                  {index + 1}
                  {flaggedQuestions.has(question.id) && (
                    <FaFlag className={styles.flagIcon} />
                  )}
                </button>
              );
            })}
          </div>
          
          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <div className={`${styles.legendBox} ${styles.answered}`}></div>
              <span>Respondida</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendBox} ${styles.flagged}`}></div>
              <span>Marcada</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendBox} ${styles.unanswered}`}></div>
              <span>Sin responder</span>
            </div>
          </div>
        </div>

        <div className={styles.questionSection}>
          <Card>
            <div className={styles.questionHeader}>
              <div className={styles.questionInfo}>
                <h2>Pregunta {currentQuestionIndex + 1} de {questions.length}</h2>
                <span className={styles.questionPoints}>
                  {currentQuestion?.points} puntos
                </span>
              </div>
              <Button
                variant="ghost"
                icon={<FaFlag />}
                onClick={() => handleFlagQuestion(currentQuestion?.id)}
                className={`${styles.flagButton} ${
                  flaggedQuestions.has(currentQuestion?.id) ? styles.flagged : ''
                }`}
              >
                {flaggedQuestions.has(currentQuestion?.id) ? 'Desmarca' : 'Marcar'}
              </Button>
            </div>

            <div className={styles.questionContent}>
              <h3 className={styles.questionText}>
                {currentQuestion?.question}
              </h3>

              <div className={styles.answerOptions}>
                {currentQuestion?.options?.map((option, index) => (
                  <label key={index} className={styles.optionLabel}>
                    <input
                      type="checkbox"
                      checked={answers[currentQuestion?.id]?.includes(index) || false}
                      onChange={(e) => {
                        const currentAnswers = answers[currentQuestion?.id] || [];
                        let newAnswers;
                        
                        if (e.target.checked) {
                          newAnswers = [...currentAnswers, index];
                        } else {
                          newAnswers = currentAnswers.filter(ans => ans !== index);
                        }
                        
                        handleAnswerChange(currentQuestion?.id, newAnswers);
                      }}
                      className={styles.optionCheckbox}
                    />
                    <span className={styles.optionText}>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.questionNavButtons}>
              <Button
                variant="outline"
                icon={<FaArrowLeft />}
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                disabled={isFirstQuestion}
              >
                Anterior
              </Button>
              
              <Button
                variant="ghost"
                icon={<FaSave />}
                onClick={() => autoSaveMutation.mutate({
                  answers,
                  flaggedQuestions: Array.from(flaggedQuestions)
                })}
                loading={autoSaveMutation.isLoading}
              >
                Guardar
              </Button>

              {!isLastQuestion ? (
                <Button
                  variant="outline"
                  icon={<FaArrowRight />}
                  iconPosition="right"
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  variant="primary"
                  icon={<FaPaperPlane />}
                  onClick={handleSubmitExam}
                >
                  Entregar Examen
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Confirmar Entrega"
        size="medium"
      >
        <div className={styles.submitModal}>
          <div className={styles.submitSummary}>
            <h3>Resumen del Examen</h3>
            <div className={styles.summaryStats}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Preguntas respondidas:</span>
                <span className={styles.summaryValue}>
                  {getAnsweredCount()} de {questions.length}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Preguntas marcadas:</span>
                <span className={styles.summaryValue}>{flaggedQuestions.size}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Tiempo restante:</span>
                <span className={styles.summaryValue}>{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>

          {getAnsweredCount() < questions.length && (
            <div className={styles.submitWarning}>
              <FaExclamationTriangle className={styles.warningIcon} />
              <p>
                Tienes {questions.length - getAnsweredCount()} pregunta(s) sin responder.
                ¿Estás seguro de que quieres entregar el examen?
              </p>
            </div>
          )}

          <div className={styles.submitActions}>
            <Button
              variant="outline"
              onClick={() => setShowSubmitModal(false)}
              disabled={isSubmitting}
            >
              Continuar Examen
            </Button>
            <Button
              variant="primary"
              onClick={confirmSubmit}
              loading={isSubmitting}
            >
              Entregar Definitivamente
            </Button>
          </div>
        </div>
      </Modal>

      {/* Warning Modal */}
      <Modal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        title="Advertencia"
        size="small"
      >
        <div className={styles.warningModal}>
          <FaExclamationTriangle className={styles.warningIcon} />
          <p>
            Has cambiado de ventana o pestaña durante el examen. 
            Por favor, mantén el foco en esta ventana para evitar problemas.
          </p>
          <div className={styles.warningActions}>
            <Button variant="primary" onClick={() => setShowWarningModal(false)}>
              Entendido
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ExamTaking;
