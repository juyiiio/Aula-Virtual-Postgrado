import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../common/Button/Button';
import Modal from '../../common/Modal/Modal';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaQuestionCircle, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaPlay, 
  FaCheck, 
  FaTimes,
  FaExclamationTriangle,
  FaChartBar,
  FaUsers
} from 'react-icons/fa';
import { examService } from '../../../services/examService';
import { toast } from 'react-toastify';
import styles from './ExamCard.module.css';

const ExamCard = ({ exam, userRole, onUpdate }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isStudent = userRole === 'student';
  const canEdit = !isStudent && (user?.id === exam.courseInstructorId || user?.roles?.some(role => role.name === 'ADMIN'));

  // Get student's attempt if exists
  const studentAttempt = exam.attempts?.find(att => att.studentId === user?.id);
  
  // Exam status for students
  const getStudentStatus = () => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);
    
    if (studentAttempt) {
      if (studentAttempt.score !== null) {
        return 'completed';
      }
      return 'in_progress';
    }
    
    if (endTime < now) {
      return 'missed';
    }
    
    if (startTime > now) {
      return 'upcoming';
    }
    
    return 'available';
  };

  // Exam status for instructors
  const getInstructorStatus = () => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);
    
    if (exam.status === 'DRAFT') return 'draft';
    if (endTime < now) return 'completed';
    if (startTime <= now && endTime > now) return 'active';
    if (startTime > now) return 'scheduled';
    
    return 'inactive';
  };

  const status = isStudent ? getStudentStatus() : getInstructorStatus();

  const getStatusBadge = () => {
    const studentStatusConfig = {
      'upcoming': { label: 'Próximo', className: styles.statusUpcoming },
      'available': { label: 'Disponible', className: styles.statusAvailable },
      'in_progress': { label: 'En Progreso', className: styles.statusInProgress },
      'completed': { label: 'Completado', className: styles.statusCompleted },
      'missed': { label: 'Perdido', className: styles.statusMissed }
    };

    const instructorStatusConfig = {
      'draft': { label: 'Borrador', className: styles.statusDraft },
      'scheduled': { label: 'Programado', className: styles.statusScheduled },
      'active': { label: 'Activo', className: styles.statusActive },
      'completed': { label: 'Finalizado', className: styles.statusCompleted },
      'inactive': { label: 'Inactivo', className: styles.statusInactive }
    };

    const config = isStudent ? studentStatusConfig[status] : instructorStatusConfig[status];
    
    return (
      <span className={`${styles.statusBadge} ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getStatusIcon = () => {
    const icons = {
      'upcoming': <FaClock />,
      'available': <FaPlay />,
      'in_progress': <FaClock />,
      'completed': <FaCheck />,
      'missed': <FaExclamationTriangle />,
      'draft': <FaEdit />,
      'scheduled': <FaCalendarAlt />,
      'active': <FaPlay />,
      'inactive': <FaTimes />
    };
    
    return icons[status] || <FaClock />;
  };

  const getExamTypeBadge = () => {
    const typeConfig = {
      'PARCIAL': { label: 'Parcial', className: styles.typeParcial },
      'FINAL': { label: 'Final', className: styles.typeFinal },
      'SUSTITUTORIO': { label: 'Sustitutorio', className: styles.typeSubstitutorio },
      'EXTRAORDINARIO': { label: 'Extraordinario', className: styles.typeExtraordinario }
    };

    const config = typeConfig[exam.examType] || typeConfig['PARCIAL'];
    
    return (
      <span className={`${styles.typeBadge} ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getTimeRemaining = () => {
    if (status !== 'upcoming') return null;
    
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const diff = startTime - now;
    
    if (diff <= 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `En ${days}d ${hours}h`;
    if (hours > 0) return `En ${hours}h ${minutes}m`;
    return `En ${minutes}m`;
  };

  const handleViewExam = () => {
    navigate(`/exams/${exam.id}`);
  };

  const handleEditExam = () => {
    navigate(`/exams/${exam.id}/edit`);
  };

  const handleTakeExam = () => {
    navigate(`/exams/${exam.id}/take`);
  };

  const handleViewResults = () => {
    navigate(`/exams/${exam.id}/results`);
  };

  const handleDeleteExam = async () => {
    setIsDeleting(true);
    try {
      await examService.deleteExam(exam.id);
      toast.success('Examen eliminado exitosamente');
      onUpdate && onUpdate();
      setShowDeleteModal(false);
    } catch (error) {
      toast.error('Error al eliminar el examen');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.examInfo}>
            <div className={styles.statusSection}>
              <div className={styles.statusIcon}>
                {getStatusIcon()}
              </div>
              <div className={styles.badges}>
                {getStatusBadge()}
                {getExamTypeBadge()}
              </div>
            </div>
            <h3 className={styles.examTitle}>{exam.title}</h3>
            <p className={styles.courseName}>{exam.course?.name}</p>
          </div>
        </div>

        <div className={styles.cardBody}>
          <p className={styles.examDescription}>
            {exam.description || 'Sin descripción disponible'}
          </p>
          
          <div className={styles.examDetails}>
            <div className={styles.detailItem}>
              <FaCalendarAlt className={styles.detailIcon} />
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Inicio:</span>
                <span className={styles.detailValue}>{formatDateTime(exam.startTime)}</span>
              </div>
            </div>
            
            <div className={styles.detailItem}>
              <FaClock className={styles.detailIcon} />
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Duración:</span>
                <span className={styles.detailValue}>{formatDuration(exam.duration)}</span>
              </div>
            </div>
            
            <div className={styles.detailItem}>
              <FaQuestionCircle className={styles.detailIcon} />
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Preguntas:</span>
                <span className={styles.detailValue}>{exam.totalQuestions || 0}</span>
              </div>
            </div>

            {getTimeRemaining() && (
              <div className={styles.detailItem}>
                <FaExclamationTriangle className={styles.detailIcon} />
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Comienza:</span>
                  <span className={`${styles.detailValue} ${styles.upcoming}`}>
                    {getTimeRemaining()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {isStudent && studentAttempt && (
            <div className={styles.attemptInfo}>
              <h4 className={styles.attemptTitle}>Mi Resultado</h4>
              <div className={styles.attemptDetails}>
                <p className={styles.attemptDate}>
                  Realizado: {formatDateTime(studentAttempt.startedAt)}
                </p>
                {studentAttempt.score !== null && (
                  <p className={styles.attemptScore}>
                    Puntuación: {studentAttempt.score}/{exam.totalPoints || 100}
                  </p>
                )}
                {studentAttempt.timeSpent && (
                  <p className={styles.attemptTime}>
                    Tiempo usado: {formatDuration(studentAttempt.timeSpent)}
                  </p>
                )}
              </div>
            </div>
          )}

          {!isStudent && (
            <div className={styles.instructorInfo}>
              <div className={styles.examStats}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{exam.attempts?.length || 0}</span>
                  <span className={styles.statLabel}>Intentos</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>
                    {exam.attempts?.filter(att => att.score !== null).length || 0}
                  </span>
                  <span className={styles.statLabel}>Completados</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>
                    {exam.attempts?.length ? 
                      Math.round(exam.attempts.filter(att => att.score !== null)
                        .reduce((acc, att) => acc + att.score, 0) / 
                        exam.attempts.filter(att => att.score !== null).length) || 0 : 0
                    }
                  </span>
                  <span className={styles.statLabel}>Promedio</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.cardFooter}>
          <div className={styles.actions}>
            <Button
              variant="primary"
              size="small"
              icon={<FaEye />}
              onClick={handleViewExam}
            >
              Ver Detalle
            </Button>

            {isStudent && status === 'available' && (
              <Button
                variant="success"
                size="small"
                icon={<FaPlay />}
                onClick={handleTakeExam}
              >
                Realizar Examen
              </Button>
            )}

            {isStudent && status === 'completed' && (
              <Button
                variant="outline"
                size="small"
                icon={<FaChartBar />}
                onClick={handleViewResults}
              >
                Ver Resultados
              </Button>
            )}

            {canEdit && (
              <>
                <Button
                  variant="outline"
                  size="small"
                  icon={<FaEdit />}
                  onClick={handleEditExam}
                >
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="small"
                  icon={<FaUsers />}
                  onClick={handleViewResults}
                >
                  Resultados
                </Button>
                <Button
                  variant="danger"
                  size="small"
                  icon={<FaTrash />}
                  onClick={() => setShowDeleteModal(true)}
                >
                  Eliminar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Eliminación"
        size="small"
      >
        <div className={styles.deleteModal}>
          <p>¿Estás seguro de que deseas eliminar el examen "{exam.title}"?</p>
          <p className={styles.deleteWarning}>
            Esta acción eliminará todos los intentos y resultados asociados.
          </p>
          <div className={styles.deleteActions}>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteExam}
              loading={isDeleting}
            >
              Eliminar Examen
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ExamCard;
