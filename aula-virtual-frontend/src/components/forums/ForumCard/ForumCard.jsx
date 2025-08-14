import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../common/Button/Button';
import Modal from '../../common/Modal/Modal';
import { 
  FaComments, 
  FaUsers, 
  FaClock, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaLock,
  FaGlobe,
  FaUserShield,
  FaPin
} from 'react-icons/fa';
import { forumService } from '../../../services/forumService';
import { toast } from 'react-toastify';
import styles from './ForumCard.module.css';

const ForumCard = ({ forum, onUpdate }) => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canEdit = hasRole(['ADMIN']) || 
    (hasRole(['INSTRUCTOR']) && forum.createdBy === user?.id) ||
    forum.moderators?.some(mod => mod.id === user?.id);

  const getVisibilityIcon = () => {
    switch (forum.visibility) {
      case 'PUBLIC':
        return <FaGlobe className={styles.visibilityIcon} />;
      case 'PRIVATE':
        return <FaLock className={styles.visibilityIcon} />;
      case 'RESTRICTED':
        return <FaUserShield className={styles.visibilityIcon} />;
      default:
        return <FaGlobe className={styles.visibilityIcon} />;
    }
  };

  const getVisibilityLabel = () => {
    switch (forum.visibility) {
      case 'PUBLIC':
        return 'Público';
      case 'PRIVATE':
        return 'Privado';
      case 'RESTRICTED':
        return 'Restringido';
      default:
        return 'Público';
    }
  };

  const handleViewForum = () => {
    navigate(`/forums/${forum.id}`);
  };

  const handleEditForum = () => {
    navigate(`/forums/${forum.id}/edit`);
  };

  const handleDeleteForum = async () => {
    setIsDeleting(true);
    try {
      await forumService.deleteForum(forum.id);
      toast.success('Foro eliminado exitosamente');
      onUpdate && onUpdate();
      setShowDeleteModal(false);
    } catch (error) {
      toast.error('Error al eliminar el foro');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLastActivity = () => {
    if (forum.lastPost) {
      return {
        date: formatDate(forum.lastPost.createdAt),
        user: `${forum.lastPost.author.firstName} ${forum.lastPost.author.lastName}`
      };
    }
    return {
      date: formatDate(forum.createdAt),
      user: 'Sin actividad reciente'
    };
  };

  const lastActivity = getLastActivity();

  return (
    <>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.forumInfo}>
            <div className={styles.forumTitle}>
              <h3 className={styles.title}>{forum.name}</h3>
              <div className={styles.forumMeta}>
                {getVisibilityIcon()}
                <span className={styles.visibilityLabel}>
                  {getVisibilityLabel()}
                </span>
                {forum.isPinned && (
                  <FaPin className={styles.pinnedIcon} title="Foro fijado" />
                )}
              </div>
            </div>
            {forum.category && (
              <div className={styles.categoryBadge}>
                {forum.category.name}
              </div>
            )}
          </div>
        </div>

        <div className={styles.cardBody}>
          <p className={styles.forumDescription}>
            {forum.description || 'Sin descripción disponible'}
          </p>
          
          <div className={styles.forumStats}>
            <div className={styles.statItem}>
              <FaComments className={styles.statIcon} />
              <div className={styles.statContent}>
                <span className={styles.statValue}>{forum.topicsCount || 0}</span>
                <span className={styles.statLabel}>Temas</span>
              </div>
            </div>
            
            <div className={styles.statItem}>
              <FaUsers className={styles.statIcon} />
              <div className={styles.statContent}>
                <span className={styles.statValue}>{forum.postsCount || 0}</span>
                <span className={styles.statLabel}>Mensajes</span>
              </div>
            </div>
            
            <div className={styles.statItem}>
              <FaClock className={styles.statIcon} />
              <div className={styles.statContent}>
                <span className={styles.statValue}>{lastActivity.date}</span>
                <span className={styles.statLabel}>Última actividad</span>
              </div>
            </div>
          </div>

          {forum.moderators && forum.moderators.length > 0 && (
            <div className={styles.moderators}>
              <h4 className={styles.moderatorsTitle}>Moderadores:</h4>
              <div className={styles.moderatorsList}>
                {forum.moderators.slice(0, 3).map(moderator => (
                  <div key={moderator.id} className={styles.moderator}>
                    <div className={styles.moderatorAvatar}>
                      {moderator.profilePicture ? (
                        <img 
                          src={moderator.profilePicture} 
                          alt={`${moderator.firstName} ${moderator.lastName}`}
                        />
                      ) : (
                        <span>
                          {moderator.firstName.charAt(0)}
                          {moderator.lastName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <span className={styles.moderatorName}>
                      {moderator.firstName} {moderator.lastName}
                    </span>
                  </div>
                ))}
                {forum.moderators.length > 3 && (
                  <span className={styles.moreModerators}>
                    +{forum.moderators.length - 3} más
                  </span>
                )}
              </div>
            </div>
          )}

          {forum.latestTopics && forum.latestTopics.length > 0 && (
            <div className={styles.latestTopics}>
              <h4 className={styles.latestTopicsTitle}>Temas recientes:</h4>
              <div className={styles.topicsList}>
                {forum.latestTopics.slice(0, 3).map(topic => (
                  <div key={topic.id} className={styles.topicItem}>
                    <div className={styles.topicInfo}>
                      <span className={styles.topicTitle}>{topic.title}</span>
                      <div className={styles.topicMeta}>
                        <span className={styles.topicAuthor}>
                          por {topic.author.firstName} {topic.author.lastName}
                        </span>
                        <span className={styles.topicDate}>
                          {formatDate(topic.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className={styles.topicStats}>
                      <span className={styles.topicReplies}>
                        {topic.repliesCount || 0} respuestas
                      </span>
                    </div>
                  </div>
                ))}
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
              onClick={handleViewForum}
            >
              Ver Foro
            </Button>

            {canEdit && (
              <>
                <Button
                  variant="outline"
                  size="small"
                  icon={<FaEdit />}
                  onClick={handleEditForum}
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
          <p>¿Estás seguro de que deseas eliminar el foro "{forum.name}"?</p>
          <p className={styles.deleteWarning}>
            Esta acción eliminará todos los temas y mensajes del foro permanentemente.
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
              onClick={handleDeleteForum}
              loading={isDeleting}
            >
              Eliminar Foro
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ForumCard;
