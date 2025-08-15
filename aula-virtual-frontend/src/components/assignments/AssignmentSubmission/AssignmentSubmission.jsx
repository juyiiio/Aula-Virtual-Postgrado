import React, { useState, useEffect } from 'react';
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import Loading from '../../common/Loading/Loading';
import useAuth from '../../../hooks/useAuth';
import assignmentService from '../../../services/assignmentService';
import useNotification from '../../../hooks/useNotification';
import { formatDateTime } from '../../../utils/dateUtils';
import { formatFileSize } from '../../../utils/formatters';
import styles from './AssignmentSubmission.module.css';

const AssignmentSubmission = ({ assignmentId, assignment }) => {
  const [submission, setSubmission] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { showError, showSuccess } = useNotification();

  useEffect(() => {
    fetchSubmission();
  }, [assignmentId, user]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const submissionData = await assignmentService.getStudentSubmission(assignmentId, user.id);
      setSubmission(submissionData);
      if (submissionData) {
        setSubmissionText(submissionData.submissionText || '');
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error fetching submission:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tamaño
    if (file.size > assignment.maxFileSize) {
      showError(`El archivo es muy grande. Tamaño máximo: ${formatFileSize(assignment.maxFileSize)}`);
      return;
    }

    // Validar extensión
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = assignment.allowedExtensions?.split(',') || [];
    if (allowedExtensions.length > 0 && !allowedExtensions.includes(fileExtension)) {
      showError(`Extensión no permitida. Extensiones válidas: ${allowedExtensions.join(', ')}`);
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (assignment.submissionType === 'FILE' && !selectedFile && !submission?.fileUrl) {
      showError('Debe seleccionar un archivo');
      return;
    }

    if (assignment.submissionType === 'TEXT' && !submissionText.trim()) {
      showError('Debe ingresar el texto de la entrega');
      return;
    }

    if (assignment.submissionType === 'BOTH' && !submissionText.trim() && (!selectedFile && !submission?.fileUrl)) {
      showError('Debe proporcionar texto y/o archivo');
      return;
    }

    setSubmitting(true);
    try {
      const submissionData = {
        submissionText: submissionText.trim(),
        file: selectedFile
      };

      if (submission) {
        await assignmentService.updateSubmission(assignmentId, submission.id, submissionData);
        showSuccess('Entrega actualizada exitosamente');
      } else {
        await assignmentService.createSubmission(assignmentId, submissionData);
        showSuccess('Entrega enviada exitosamente');
      }

      fetchSubmission();
      setSelectedFile(null);
    } catch (error) {
      const message = error?.response?.data?.message || 'Error al enviar la entrega';
      showError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading message="Cargando entrega..." />;
  }

  const isSubmitted = !!submission;
  const isGraded = submission?.status === 'GRADED';

  return (
    <div className={styles.container}>
      <Card title="Mi Entrega">
        {isSubmitted && (
          <div className={styles.submissionInfo}>
            <div className={styles.statusBadge}>
              <span className={`${styles.status} ${styles[submission.status?.toLowerCase()]}`}>
                {submission.status === 'SUBMITTED' ? 'Entregado' : 
                 submission.status === 'GRADED' ? 'Calificado' : 
                 submission.status === 'LATE' ? 'Entrega tardía' : submission.status}
              </span>
            </div>
            
            <div className={styles.submissionMeta}>
              <p><strong>Fecha de entrega:</strong> {formatDateTime(submission.submissionDate)}</p>
              {isGraded && (
                <>
                  <p><strong>Calificación:</strong> {submission.grade}/{assignment.maxPoints}</p>
                  <p><strong>Calificado el:</strong> {formatDateTime(submission.gradedAt)}</p>
                </>
              )}
            </div>

            {submission.feedback && (
              <div className={styles.feedback}>
                <h4>Retroalimentación del Instructor:</h4>
                <p>{submission.feedback}</p>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {(assignment.submissionType === 'TEXT' || assignment.submissionType === 'BOTH') && (
            <Input
              label="Texto de la Entrega"
              type="textarea"
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Escriba su entrega aquí..."
              rows="8"
              required={assignment.submissionType === 'TEXT'}
            />
          )}

          {(assignment.submissionType === 'FILE' || assignment.submissionType === 'BOTH') && (
            <div className={styles.fileSection}>
              <label className={styles.fileLabel}>Archivo de Entrega:</label>
              
              {submission?.fileUrl && (
                <div className={styles.currentFile}>
                  <p><strong>Archivo actual:</strong> {submission.fileName}</p>
                  <a 
                    href={submission.fileUrl} 
                    download 
                    className={styles.downloadLink}
                  >
                    Descargar archivo
                  </a>
                </div>
              )}

              <input
                type="file"
                onChange={handleFileChange}
                className={styles.fileInput}
                accept={assignment.allowedExtensions?.split(',').map(ext => `.${ext}`).join(',')}
              />
              
              {selectedFile && (
                <div className={styles.selectedFile}>
                  <p><strong>Archivo seleccionado:</strong> {selectedFile.name}</p>
                  <p><strong>Tamaño:</strong> {formatFileSize(selectedFile.size)}</p>
                </div>
              )}

              <div className={styles.fileInfo}>
                <p><strong>Tamaño máximo:</strong> {formatFileSize(assignment.maxFileSize)}</p>
                <p><strong>Extensiones permitidas:</strong> {assignment.allowedExtensions}</p>
              </div>
            </div>
          )}

          <div className={styles.actions}>
            <Button
              type="submit"
              variant={isSubmitted ? "outline" : "primary"}
              loading={submitting}
            >
              {isSubmitted ? 'Actualizar Entrega' : 'Enviar Entrega'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AssignmentSubmission;
