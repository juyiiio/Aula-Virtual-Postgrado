import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import Modal from '../../common/Modal/Modal';
import useAuth from '../../../hooks/useAuth';
import announcementService from '../../../services/announcementService';
import useNotification from '../../../hooks/useNotification';
import { formatDateTime, isPastDate } from '../../../utils/dateUtils';
import { formatStatus } from '../../../utils/formatters';
import styles from './AnnouncementCard.module.css';

const AnnouncementCard = ({ announcement, onUpdate }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { hasRole } = useAuth();
  const { showError, showSuccess } = useNotification();

  const {
    id,
    title,
    content,
    summary,
    status,
    priority,
    publishedAt,
    scheduledAt,
    author,
    course,
    isPinned,
    viewsCount = 0
  } = announcement;

  const canEdit = hasRole('ADMIN') || hasRole('INSTRUCTOR');
  const isPublished = status === 'PUBLISHED';
  const isScheduled = status === 'SCHEDULED' && scheduledAt && !isPastDate(scheduledAt);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await announcementService.deleteAnnouncement(id);
      showSuccess('Anuncio eliminado exitosamente');
      setShowDeleteModal(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      const message = error?.response?.data?.message || 'Error al eliminar el anuncio';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePin = async () => {
    try {
      await announcementService.togglePin(id);
      showSuccess(isPinned ? 'Anuncio desanclado' : 'Anuncio anclado');
      if (onUpdate) onUpdate();
    } catch (error) {
      const message = error?.response?.data?.message || 'Error al cambiar el estado del anuncio';
      showError(message);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'error';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'info';
      default: return 'gray';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'HIGH': return 'Alta';
      case 'MEDIUM': return 'Media';
      case 'LOW': return 'Baja';
      default: return priority;
    }
  };

  return (
    <>
      <Card className={`${styles.card} ${isPinned ? styles.pinned : ''}`} hoverable>
        {isPinned && (
          <div className={styles.pinnedBadge}>
            📌 Anuncio Fijado
          </div>
        )}

        <div className={styles.header}>
          <div className={styles.announcementInfo}>
            <h3 className={styles.announcementTitle}>{title}</h3>
            {course && (
              <p className={styles.courseName}>{course.name}</p>
            )}
          </div>

          <div className={styles.badges}>
            <span className={`${styles.status} ${styles[status?.toLowerCase()]}`}>
              {formatStatus(status)}
            </span>
            
            <span className={`${styles.priority} ${styles[getPriorityColor(priority)]}`}>
              {getPriorityText(priority)}
            </span>
          </div>
        </div>

        <div className={styles.content}>
          {summary ? (
            <p className={styles.summary}>{summary}</p>
          ) : (
            <p className={styles.contentPreview}>
              {content?.length > 200 ? `${content.substring(0, 200)}...` : content}
            </p>
          )}

          <div className={styles.metadata}>
            <div className={styles.metadataItem}>
              <span className={styles.label}>Autor:</span>
              <span>{author?.firstName} {author?.lastName}</span>
            </div>

            {isPublished && publishedAt && (
              <div className={styles.metadataItem}>
                <span className={styles.label}>Publicado:</span>
                <span>{formatDateTime(publishedAt)}</span>
              </div>
            )}

            {isScheduled && scheduledAt && (
              <div className={styles.metadataItem}>
                <span className={styles.label}>Programado para:</span>
                <span>{formatDateTime(scheduledAt)}</span>
              </div>
            )}

            <div className={styles.metadataItem}>
              <span className={styles.label}>Vistas:</span>
              <span>{viewsCount}</span>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            <Link to={`/announcements/${id}`}>
              <Button variant="outline" size="small">
                Ver Completo
              </Button>
            </Link>
          </div>

          {canEdit && (
            <div className={styles.footerRight}>
              <Button
                variant="ghost"
                size="small"
                onClick={handleTogglePin}
              >
                {isPinned ? '📌 Desanclar' : '📌 Anclar'}
              </Button>

              <Link to={`/announcements/${id}/edit`}>
                <Button variant="ghost" size="small">
                  ✏️ Editar
                </Button>
              </Link>

              <Button
                variant="error"
                size="small"
                onClick={() => setShowDeleteModal(true)}
              >
                🗑️ Eliminar
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Eliminación"
      >
        <div className={styles.deleteModal}>
          <p>¿Estás seguro de que quieres eliminar este anuncio?</p>
          <p><strong>{title}</strong></p>
          <p className={styles.deleteWarning}>Esta acción no se puede deshacer.</p>
          
          <div className={styles.deleteActions}>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancelar
            </Button>
            
            <Button
              variant="error"
              onClick={handleDelete}
              loading={loading}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AnnouncementCard;
