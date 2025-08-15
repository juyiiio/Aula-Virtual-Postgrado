import React, { useState } from 'react';
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import Modal from '../../common/Modal/Modal';
import useAuth from '../../../hooks/useAuth';
import fileService from '../../../services/fileService';
import useNotification from '../../../hooks/useNotification';
import { formatDate } from '../../../utils/dateUtils';
import { formatFileSize } from '../../../utils/formatters';
import styles from './ResourceCard.module.css';

const ResourceCard = ({ resource, onUpdate }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { hasRole } = useAuth();
  const { showError, showSuccess } = useNotification();

  const {
    id,
    name,
    description,
    fileName,
    fileSize,
    fileUrl,
    category,
    mimeType,
    downloadCount = 0,
    uploadedBy,
    uploadedAt,
    course,
    tags = []
  } = resource;

  const canDelete = hasRole('ADMIN') || hasRole('INSTRUCTOR');

  const getFileIcon = (category, mimeType) => {
    switch (category) {
      case 'DOCUMENT':
        if (mimeType?.includes('pdf')) return '📄';
        if (mimeType?.includes('word')) return '📘';
        return '📋';
      case 'VIDEO': return '🎥';
      case 'AUDIO': return '🎵';
      case 'IMAGE': return '🖼️';
      case 'PRESENTATION': return '📊';
      case 'SPREADSHEET': return '📗';
      default: return '📁';
    }
  };

  const getCategoryName = (category) => {
    const categories = {
      DOCUMENT: 'Documento',
      VIDEO: 'Video',
      AUDIO: 'Audio', 
      IMAGE: 'Imagen',
      PRESENTATION: 'Presentación',
      SPREADSHEET: 'Hoja de cálculo',
      OTHER: 'Otro'
    };
    return categories[category] || category;
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await fileService.downloadResource(id);
      
      // Crear enlace de descarga
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSuccess('Descarga iniciada');
      if (onUpdate) onUpdate();
    } catch (error) {
      const message = error?.response?.data?.message || 'Error al descargar el archivo';
      showError(message);
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fileService.deleteResource(id);
      showSuccess('Recurso eliminado exitosamente');
      setShowDeleteModal(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      const message = error?.response?.data?.message || 'Error al eliminar el recurso';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  const canPreview = mimeType?.includes('pdf') || 
                    mimeType?.includes('image') || 
                    mimeType?.includes('text');

  return (
    <>
      <Card className={styles.card} hoverable>
        <div className={styles.header}>
          <div className={styles.fileInfo}>
            <div className={styles.fileIcon}>
              {getFileIcon(category, mimeType)}
            </div>
            <div className={styles.fileDetails}>
              <h3 className={styles.fileName}>{name}</h3>
              <p className={styles.originalFileName}>{fileName}</p>
            </div>
          </div>
          
          <span className={styles.category}>
            {getCategoryName(category)}
          </span>
        </div>

        <div className={styles.content}>
          {description && (
            <p className={styles.description}>{description}</p>
          )}

          <div className={styles.metadata}>
            <div className={styles.metadataItem}>
              <span className={styles.label}>Tamaño:</span>
              <span>{formatFileSize(fileSize)}</span>
            </div>

            <div className={styles.metadataItem}>
              <span className={styles.label}>Descargas:</span>
              <span>{downloadCount}</span>
            </div>

            <div className={styles.metadataItem}>
              <span className={styles.label}>Subido por:</span>
              <span>{uploadedBy?.firstName} {uploadedBy?.lastName}</span>
            </div>

            <div className={styles.metadataItem}>
              <span className={styles.label}>Fecha:</span>
              <span>{formatDate(uploadedAt)}</span>
            </div>

            {course && (
              <div className={styles.metadataItem}>
                <span className={styles.label}>Curso:</span>
                <span>{course.name}</span>
              </div>
            )}
          </div>

          {tags.length > 0 && (
            <div className={styles.tags}>
              {tags.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            <Button
              variant="primary"
              size="small"
              onClick={handleDownload}
              loading={downloading}
            >
              📥 Descargar
            </Button>
            
            {canPreview && (
              <Button
                variant="outline"
                size="small"
                onClick={handlePreview}
              >
                👁️ Vista previa
              </Button>
            )}
          </div>

          {canDelete && (
            <div className={styles.footerRight}>
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
          <p>¿Estás seguro de que quieres eliminar este recurso?</p>
          <p><strong>{name}</strong></p>
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

export default ResourceCard;
