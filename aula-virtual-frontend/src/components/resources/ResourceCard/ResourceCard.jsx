import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../common/Button/Button';
import Modal from '../../common/Modal/Modal';
import ResourceViewer from '../ResourceViewer/ResourceViewer';
import { 
  FaDownload, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaUser,
  FaClock,
  FaFile,
  FaImage,
  FaVideo,
  FaFileAudio,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileArchive,
  FaShare,
  FaHeart,
  FaRegHeart,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { resourceService } from '../../../services/resourceService';
import { toast } from 'react-toastify';
import styles from './ResourceCard.module.css';

const ResourceCard = ({ resource, viewMode = 'grid', onUpdate }) => {
  const { user, hasRole } = useAuth();
  const [showViewer, setShowViewer] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);

  const canEdit = hasRole(['ADMIN']) || 
    (hasRole(['INSTRUCTOR']) && resource.uploadedBy === user?.id);

  const canDelete = hasRole(['ADMIN']) || 
    resource.uploadedBy === user?.id;

  const getFileTypeIcon = () => {
    const iconMap = {
      'image': <FaImage className={styles.fileIconImage} />,
      'video': <FaVideo className={styles.fileIconVideo} />,
      'audio': <FaFileAudio className={styles.fileIconAudio} />,
      'pdf': <FaFilePdf className={styles.fileIconPdf} />,
      'document': <FaFileWord className={styles.fileIconDocument} />,
      'spreadsheet': <FaFileExcel className={styles.fileIconSpreadsheet} />,
      'presentation': <FaFilePowerpoint className={styles.fileIconPresentation} />,
      'archive': <FaFileArchive className={styles.fileIconArchive} />,
      'other': <FaFile className={styles.fileIconOther} />
    };
    return iconMap[resource.fileType] || iconMap['other'];
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await resourceService.downloadResource(resource.id);
      toast.success('Descarga iniciada');
      onUpdate && onUpdate();
    } catch (error) {
      toast.error('Error al descargar el archivo');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleView = () => {
    setShowViewer(true);
  };

  const handleEdit = () => {
    // Navigate to edit form or open edit modal
    // Implementation depends on your routing setup
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await resourceService.deleteResource(resource.id);
      toast.success('Recurso eliminado exitosamente');
      onUpdate && onUpdate();
      setShowDeleteModal(false);
    } catch (error) {
      toast.error('Error al eliminar el recurso');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleFavorite = async () => {
    setIsFavoriting(true);
    try {
      if (resource.isFavorite) {
        await resourceService.removeFromFavorites(resource.id);
        toast.success('Eliminado de favoritos');
      } else {
        await resourceService.addToFavorites(resource.id);
        toast.success('Agregado a favoritos');
      }
      onUpdate && onUpdate();
    } catch (error) {
      toast.error('Error al actualizar favoritos');
    } finally {
      setIsFavoriting(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: resource.name,
          text: resource.description,
          url: resource.shareUrl || window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(resource.shareUrl || window.location.href);
        toast.success('Enlace copiado al portapapeles');
      }
    } catch (error) {
      toast.error('Error al compartir');
    }
  };

  const isPreviewable = ['image', 'pdf', 'video', 'audio'].includes(resource.fileType);

  if (viewMode === 'list') {
    return (
      <>
        <div className={styles.listCard}>
          <div className={styles.listFileIcon}>
            {getFileTypeIcon()}
          </div>
          
          <div className={styles.listContent}>
            <div className={styles.listHeader}>
              <h3 className={styles.listTitle}>{resource.name}</h3>
              <div className={styles.listMeta}>
                <span className={styles.listCategory}>{resource.category?.name}</span>
                <span className={styles.listSize}>{formatFileSize(resource.size)}</span>
                <span className={styles.listDate}>{formatDate(resource.createdAt)}</span>
              </div>
            </div>
            
            <p className={styles.listDescription}>
              {resource.description || 'Sin descripción'}
            </p>
            
            <div className={styles.listFooter}>
              <div className={styles.listUploader}>
                <FaUser className={styles.uploaderIcon} />
                <span>{resource.uploader?.firstName} {resource.uploader?.lastName}</span>
              </div>
              
              <div className={styles.listStats}>
                <span className={styles.downloadCount}>
                  <FaDownload />
                  {resource.downloadCount || 0}
                </span>
              </div>
            </div>
          </div>
          
          <div className={styles.listActions}>
            <Button
              variant="ghost"
              size="small"
              icon={resource.isFavorite ? <FaHeart /> : <FaRegHeart />}
              onClick={handleToggleFavorite}
              loading={isFavoriting}
              className={resource.isFavorite ? styles.favoriteActive : ''}
            />
            
            {isPreviewable && (
              <Button
                variant="ghost"
                size="small"
                icon={<FaEye />}
                onClick={handleView}
              />
            )}
            
            <Button
              variant="ghost"
              size="small"
              icon={<FaDownload />}
              onClick={handleDownload}
              loading={isDownloading}
            />
            
            <Button
              variant="ghost"
              size="small"
              icon={<FaShare />}
              onClick={handleShare}
            />
            
            {canEdit && (
              <Button
                variant="ghost"
                size="small"
                icon={<FaEdit />}
                onClick={handleEdit}
              />
            )}
            
            {canDelete && (
              <Button
                variant="ghost"
                size="small"
                icon={<FaTrash />}
                onClick={() => setShowDeleteModal(true)}
              />
            )}
          </div>
        </div>

        {/* Modals */}
        {showViewer && (
          <Modal
            isOpen={showViewer}
            onClose={() => setShowViewer(false)}
            title={resource.name}
            size="large"
          >
            <ResourceViewer resource={resource} />
          </Modal>
        )}

        {showDeleteModal && (
          <Modal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            title="Confirmar Eliminación"
            size="small"
          >
            <div className={styles.deleteModal}>
              <p>¿Estás seguro de que deseas eliminar "{resource.name}"?</p>
              <p className={styles.deleteWarning}>Esta acción no se puede deshacer.</p>
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
                  onClick={handleDelete}
                  loading={isDeleting}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </>
    );
  }

  // Grid view (default)
  return (
    <>
      <div className={styles.gridCard}>
        <div className={styles.cardHeader}>
          <div className={styles.fileIcon}>
            {getFileTypeIcon()}
          </div>
          
          <div className={styles.cardActions}>
            <Button
              variant="ghost"
              size="small"
              icon={resource.isFavorite ? <FaHeart /> : <FaRegHeart />}
              onClick={handleToggleFavorite}
              loading={isFavoriting}
              className={resource.isFavorite ? styles.favoriteActive : ''}
            />
          </div>
        </div>
        
        {resource.thumbnail && (
          <div className={styles.thumbnail}>
            <img src={resource.thumbnail} alt={resource.name} />
            {isPreviewable && (
              <div className={styles.thumbnailOverlay}>
                <Button
                  variant="ghost"
                  icon={<FaEye />}
                  onClick={handleView}
                />
              </div>
            )}
          </div>
        )}
        
        <div className={styles.cardContent}>
          <div className={styles.cardInfo}>
            <h3 className={styles.cardTitle}>{resource.name}</h3>
            
            <div className={styles.cardMeta}>
              <span className={styles.fileSize}>{formatFileSize(resource.size)}</span>
              <span className={styles.uploadDate}>{formatDate(resource.createdAt)}</span>
            </div>
            
            {resource.description && (
              <p className={styles.cardDescription}>
                {resource.description}
              </p>
            )}
            
            {resource.category && (
              <div className={styles.categoryBadge}>
                {resource.category.name}
              </div>
            )}
          </div>
          
          <div className={styles.cardFooter}>
            <div className={styles.uploaderInfo}>
              <div className={styles.uploaderAvatar}>
                {resource.uploader?.profilePicture ? (
                  <img 
                    src={resource.uploader.profilePicture} 
                    alt={resource.uploader.firstName}
                  />
                ) : (
                  <FaUser />
                )}
              </div>
              <div className={styles.uploaderDetails}>
                <span className={styles.uploaderName}>
                  {resource.uploader?.firstName} {resource.uploader?.lastName}
                </span>
                <div className={styles.resourceStats}>
                  <span className={styles.downloadCount}>
                    <FaDownload />
                    {resource.downloadCount || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.cardActionsFooter}>
          {isPreviewable && (
            <Button
              variant="outline"
              size="small"
              icon={<FaEye />}
              onClick={handleView}
            >
              Vista previa
            </Button>
          )}
          
          <Button
            variant="primary"
            size="small"
            icon={<FaDownload />}
            onClick={handleDownload}
            loading={isDownloading}
          >
            Descargar
          </Button>
          
          <Button
            variant="ghost"
            size="small"
            icon={<FaShare />}
            onClick={handleShare}
          />
          
          {canEdit && (
            <Button
              variant="ghost"
              size="small"
              icon={<FaEdit />}
              onClick={handleEdit}
            />
          )}
          
          {canDelete && (
            <Button
              variant="ghost"
              size="small"
              icon={<FaTrash />}
              onClick={() => setShowDeleteModal(true)}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {showViewer && (
        <Modal
          isOpen={showViewer}
          onClose={() => setShowViewer(false)}
          title={resource.name}
          size="large"
        >
          <ResourceViewer resource={resource} />
        </Modal>
      )}

      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Confirmar Eliminación"
          size="small"
        >
          <div className={styles.deleteModal}>
            <p>¿Estás seguro de que deseas eliminar "{resource.name}"?</p>
            <p className={styles.deleteWarning}>Esta acción no se puede deshacer.</p>
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
                onClick={handleDelete}
                loading={isDeleting}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ResourceCard;
