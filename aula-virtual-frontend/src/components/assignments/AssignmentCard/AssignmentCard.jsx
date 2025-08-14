import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../common/Button/Button';
import Modal from '../../common/Modal/Modal';
import { FaCalendarAlt, FaClock, FaFileAlt, FaEdit, FaTrash, FaEye, FaUpload, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { assignmentService } from '../../../services/assignmentService';
import { toast } from 'react-toastify';
import styles from './AssignmentCard.module.css';

const AssignmentCard = ({ assignment, userRole, userId, onUpdate }) => {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isStudent = userRole === 'STUDENT';
  const canEdit = userRole === 'ADMIN' || (userRole === 'INSTRUCTOR' && assignment.course?.instructorId === userId);
  
  // Get submission for student
  const studentSubmission = assignment.submissions?.find(sub => sub.studentId === userId);
  const hasSubmitted = !!studentSubmission;
  const isOverdue = new Date(assignment.dueDate) < new Date() && !hasSubmitted;
  const canSubmit = isStudent && !hasSubmitted && !isOverdue && assignment.status === 'ACTIVE';

  const handleViewAssignment = () => {
    navigate(`/assignments/${assignment.id}`);
  };

  const handleEditAssignment = () => {
    navigate(`/assignments/${assignment.id}/edit`);
  };

  const handleDeleteAssignment = async () => {
    setIsDeleting(true);
    try {
      await assignmentService.deleteAssignment(assignment.id);
      toast.success('Tarea eliminada exitosamente');
      onUpdate && onUpdate();
      setShowDeleteModal(false);
    } catch (error) {
      toast.error('Error al eliminar la tarea');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmitAssignment = () => {
    navigate(`/assignments/${assignment.id}/submit`);
  };

  const getStatusBadge = () => {
    if (isStudent) {
      if (hasSubmitted) {
        const isGraded = studentSubmission.grade !== null;
        return (
          <span className={`${styles.statusBadge} ${isGraded ? styles.statusGraded : styles.statusSubmitted}`}>
            {isGraded ? `Calificada (${studentSubmission.grade})` : 'Entregada'}
          </span>
        );
      } else if (isOverdue) {
        return (
          <span className={`${styles.statusBadge} ${styles.statusOverdue}`}>
            Vencida
          </span>
        );
      } else {
        return (
          <span className={`${styles.statusBadge} ${styles.statusPending}`}>
            Pendiente
          </span>
        );
      }
    } else {
      const statusClasses = {
        'ACTIVE': styles.statusActive,
        'INACTIVE': styles.statusInactive,
        'CLOSED': styles.statusClosed
      };

      const statusTexts = {
        'ACTIVE': 'Activa',
        'INACTIVE': 'Inactiva',
        'CLOSED': 'Cerrada'
      };

      return (
        <span className={`${styles.statusBadge} ${statusClasses[assignment.status]}`}>
          {statusTexts[assignment.status]}
        </span>
      );
    }
  };

  const getPriorityIcon = () => {
    if (isOverdue && isStudent) {
      return <FaExclamationTriangle className={styles.priorityIconOverdue} />;
    }
    if (hasSubmitted && isStudent) {
      return <FaCheckCircle className={styles.priorityIconSubmitted} />;
    }
    return null;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const diff = dueDate - now;

    if (diff < 0) return 'Vencida';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days} día${days > 1 ? 's' : ''} restante${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hora${hours > 1 ? 's' : ''} restante${hours > 1 ? 's' : ''}`;
    } else {
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${minutes} minuto${minutes > 1 ? 's' : ''} restante${minutes > 1 ? 's' : ''}`;
    }
  };

  return (
    <>
      <div className={`${styles.card} ${isOverdue && isStudent ? styles.cardOverdue : ''}`}>
        <div className={styles.cardHeader}>
          <div className={styles.assignmentInfo}>
            {getPriorityIcon()}
            <h3 className={styles.assignmentTitle}>{assignment.title}</h3>
            <p className={styles.courseName}>{assignment.course?.name}</p>
          </div>
          {getStatusBadge()}
        </div>

        <div className={styles.cardBody}>
          <p className={styles.assignmentDescription}>
            {assignment.description || 'Sin descripción disponible'}
          </p>
          
          <div className={styles.assignmentDetails}>
            <div className={styles.detailItem}>
              <FaCalendarAlt className={styles.detailIcon} />
              <span>Vence: {formatDate(assignment.dueDate)}</span>
            </div>
            
            <div className={styles.detailItem}>
              <FaClock className={styles.detailIcon} />
              <span>{getTimeRemaining()}</span>
            </div>
            
            <div className={styles.detailItem}>
              <FaFileAlt className={styles.detailIcon} />
              <span>{assignment.maxPoints || 0} puntos</span>
            </div>

            {!isStudent && (
              <div className={styles.detailItem}>
                <FaUpload className={styles.detailIcon} />
                <span>{assignment.submissions?.length || 0} entregas</span>
              </div>
            )}
          </div>

          {isStudent && hasSubmitted && (
            <div className={styles.submissionInfo}>
              <h4>Tu entrega:</h4>
              <p className={styles.submissionDate}>
                Entregado: {formatDate(studentSubmission.submissionDate)}
              </p>
              {studentSubmission.grade !== null && (
                <div className={styles.gradeInfo}>
                  <span className={styles.grade}>
                    Nota: {studentSubmission.grade}/{assignment.maxPoints}
                  </span>
                  {studentSubmission.feedback && (
                    <p className={styles.feedback}>
                      Comentarios: {studentSubmission.feedback}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.cardFooter}>
          <div className={styles.actions}>
            <Button
              variant="primary"
              size="small"
              icon={<FaEye />}
              onClick={handleViewAssignment}
            >
              Ver Detalles
            </Button>

            {canSubmit && (
              <Button
                variant="success"
                size="small"
                icon={<FaUpload />}
                onClick={handleSubmitAssignment}
              >
                Entregar
              </Button>
            )}

            {canEdit && (
              <>
                <Button
                  variant="outline"
                  size="small"
                  icon={<FaEdit />}
                  onClick={handleEditAssignment}
                >
                  Editar
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
          <p>¿Estás seguro de que deseas eliminar la tarea "{assignment.title}"?</p>
          <p className={styles.deleteWarning}>
            Esta acción eliminará todas las entregas y calificaciones asociadas.
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
              onClick={handleDeleteAssignment}
              loading={isDeleting}
            >
              Eliminar Tarea
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AssignmentCard;
