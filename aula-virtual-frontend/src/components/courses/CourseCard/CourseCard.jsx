import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../common/Button/Button';
import Modal from '../../common/Modal/Modal';
import { FaUsers, FaCalendarAlt, FaClock, FaEdit, FaTrash, FaEye, FaPlay } from 'react-icons/fa';
import { courseService } from '../../../services/courseService';
import { toast } from 'react-toastify';
import styles from './CourseCard.module.css';

const CourseCard = ({ course, onUpdate }) => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canEdit = hasRole(['ADMIN']) || (hasRole(['INSTRUCTOR']) && course.instructorId === user?.id);
  const canEnroll = hasRole(['STUDENT']) && !course.enrollments?.some(e => e.studentId === user?.id);

  const handleViewCourse = () => {
    navigate(`/courses/${course.id}`);
  };

  const handleEditCourse = () => {
    navigate(`/courses/${course.id}/edit`);
  };

  const handleDeleteCourse = async () => {
    setIsDeleting(true);
    try {
      await courseService.deleteCourse(course.id);
      toast.success('Curso eliminado exitosamente');
      onUpdate && onUpdate();
      setShowDeleteModal(false);
    } catch (error) {
      toast.error('Error al eliminar el curso');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEnrollCourse = async () => {
    try {
      await courseService.enrollStudent(course.id, user?.id);
      toast.success('Te has inscrito al curso exitosamente');
      onUpdate && onUpdate();
    } catch (error) {
      toast.error('Error al inscribirse al curso');
    }
  };

  const getStatusBadge = () => {
    const statusClasses = {
      'ACTIVE': styles.statusActive,
      'INACTIVE': styles.statusInactive,
      'COMPLETED': styles.statusCompleted
    };

    const statusTexts = {
      'ACTIVE': 'Activo',
      'INACTIVE': 'Inactivo',
      'COMPLETED': 'Completado'
    };

    return (
      <span className={`${styles.statusBadge} ${statusClasses[course.status]}`}>
        {statusTexts[course.status]}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.courseInfo}>
            <h3 className={styles.courseName}>{course.name}</h3>
            <p className={styles.courseCode}>{course.code}</p>
          </div>
          {getStatusBadge()}
        </div>

        <div className={styles.cardBody}>
          <p className={styles.courseDescription}>
            {course.description || 'Sin descripción disponible'}
          </p>
          
          <div className={styles.courseDetails}>
            <div className={styles.detailItem}>
              <FaUsers className={styles.detailIcon} />
              <span>{course.enrollments?.length || 0} estudiantes</span>
            </div>
            
            <div className={styles.detailItem}>
              <FaClock className={styles.detailIcon} />
              <span>{course.credits || 0} créditos</span>
            </div>
            
            {course.startDate && (
              <div className={styles.detailItem}>
                <FaCalendarAlt className={styles.detailIcon} />
                <span>Inicio: {formatDate(course.startDate)}</span>
              </div>
            )}
          </div>

          {course.instructor && (
            <div className={styles.instructorInfo}>
              <p className={styles.instructorLabel}>Instructor:</p>
              <p className={styles.instructorName}>
                {course.instructor.firstName} {course.instructor.lastName}
              </p>
            </div>
          )}
        </div>

        <div className={styles.cardFooter}>
          <div className={styles.actions}>
            <Button
              variant="primary"
              size="small"
              icon={<FaEye />}
              onClick={handleViewCourse}
            >
              Ver Curso
            </Button>

            {canEnroll && (
              <Button
                variant="success"
                size="small"
                icon={<FaPlay />}
                onClick={handleEnrollCourse}
              >
                Inscribirse
              </Button>
            )}

            {canEdit && (
              <>
                <Button
                  variant="outline"
                  size="small"
                  icon={<FaEdit />}
                  onClick={handleEditCourse}
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
          <p>¿Estás seguro de que deseas eliminar el curso "{course.name}"?</p>
          <p className={styles.deleteWarning}>
            Esta acción no se puede deshacer y eliminará todo el contenido del curso.
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
              onClick={handleDeleteCourse}
              loading={isDeleting}
            >
              Eliminar Curso
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CourseCard;
