import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../common/Button/Button';
import Card from '../../common/Card/Card';
import Loading from '../../common/Loading/Loading';
import { FaArrowLeft, FaUpload, FaFileAlt, FaTimes, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { assignmentService } from '../../../services/assignmentService';
import { toast } from 'react-toastify';
import styles from './AssignmentSubmission.module.css';

const AssignmentSubmission = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [submissionText, setSubmissionText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: assignment, isLoading } = useQuery(
    ['assignment', id],
    () => assignmentService.getAssignmentById(id),
    {
      onError: (error) => {
        toast.error('Error al cargar la tarea');
        navigate('/assignments');
      }
    }
  );

  const { data: existingSubmission } = useQuery(
    ['assignment-submission', id, user?.id],
    () => assignmentService.getStudentSubmission(id, user?.id),
    {
      enabled: !!assignment && !!user?.id
    }
  );

  const submitAssignmentMutation = useMutation(
    (submissionData) => assignmentService.submitAssignment(id, submissionData),
    {
      onSuccess: () => {
        toast.success('Tarea entregada exitosamente');
        navigate('/assignments');
      },
      onError: (error) => {
        toast.error('Error al entregar la tarea');
      }
    }
  );

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate file size
      if (file.size > assignment.maxFileSize) {
        toast.error(`El archivo es demasiado grande. Máximo permitido: ${(assignment.maxFileSize / (1024 * 1024)).toFixed(1)}MB`);
        return;
      }

      // Validate file extension
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const allowedExtensions = assignment.allowedExtensions.split(',').map(ext => ext.trim().toLowerCase());
      
      if (!allowedExtensions.includes(fileExtension)) {
        toast.error(`Tipo de archivo no permitido. Extensiones permitidas: ${assignment.allowedExtensions}`);
        return;
      }

      setSelectedFile(file);
    }
  }, [assignment]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    disabled: existingSubmission || new Date() > new Date(assignment?.dueDate)
  });

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!assignment) return;

    // Validate submission based on type
    if (assignment.submissionType === 'FILE' && !selectedFile) {
      toast.error('Debe adjuntar un archivo');
      return;
    }

    if (assignment.submissionType === 'TEXT' && !submissionText.trim()) {
      toast.error('Debe escribir una respuesta');
      return;
    }

    if (assignment.submissionType === 'BOTH' && !selectedFile && !submissionText.trim()) {
      toast.error('Debe adjuntar un archivo o escribir una respuesta');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('studentId', user.id);
      
      if (submissionText.trim()) {
        formData.append('submissionText', submissionText);
      }
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      await submitAssignmentMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/assignments');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isOverdue = assignment && new Date() > new Date(assignment.dueDate);
  const canSubmit = assignment && !existingSubmission && !isOverdue && assignment.status === 'ACTIVE';

  if (isLoading) {
    return <Loading text="Cargando tarea..." />;
  }

  if (!assignment) {
    return (
      <div className={styles.notFound}>
        <h2>Tarea no encontrada</h2>
        <p>La tarea que buscas no existe o no tienes permisos para verla.</p>
        <Button variant="primary" onClick={handleBack}>
          Volver a Tareas
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          variant="ghost"
          icon={<FaArrowLeft />}
          onClick={handleBack}
        >
          Volver
        </Button>
        <h1 className={styles.title}>Entregar Tarea</h1>
      </div>

      <div className={styles.content}>
        <Card title="Información de la Tarea" className={styles.assignmentInfo}>
          <div className={styles.assignmentDetails}>
            <h3 className={styles.assignmentTitle}>{assignment.title}</h3>
            <p className={styles.courseName}>{assignment.course?.name}</p>
            
            <div className={styles.assignmentMeta}>
              <div className={styles.metaItem}>
                <FaCalendarAlt className={styles.metaIcon} />
                <span>Vence: {formatDate(assignment.dueDate)}</span>
              </div>
              <div className={styles.metaItem}>
                <FaClock className={styles.metaIcon} />
                <span>{assignment.maxPoints} puntos</span>
              </div>
            </div>

            {assignment.description && (
              <div className={styles.description}>
                <h4>Descripción:</h4>
                <p>{assignment.description}</p>
              </div>
            )}

            {assignment.instructions && (
              <div className={styles.instructions}>
                <h4>Instrucciones:</h4>
                <div className={styles.instructionsContent}>
                  {assignment.instructions.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {existingSubmission ? (
          <Card title="Tu Entrega" className={styles.existingSubmission}>
            <div className={styles.submissionDetails}>
              <div className={styles.submissionStatus}>
                <h4>Estado: Entregada</h4>
                <p>Entregado el: {formatDate(existingSubmission.submissionDate)}</p>
                {existingSubmission.grade !== null && (
                  <div className={styles.gradeInfo}>
                    <span className={styles.grade}>
                      Calificación: {existingSubmission.grade}/{assignment.maxPoints}
                    </span>
                    {existingSubmission.feedback && (
                      <div className={styles.feedback}>
                        <h5>Comentarios del instructor:</h5>
                        <p>{existingSubmission.feedback}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {existingSubmission.submissionText && (
                <div className={styles.submissionText}>
                  <h5>Texto de la entrega:</h5>
                  <div className={styles.textContent}>
                    {existingSubmission.submissionText}
                  </div>
                </div>
              )}

              {existingSubmission.fileName && (
                <div className={styles.submissionFile}>
                  <h5>Archivo entregado:</h5>
                  <div className={styles.fileInfo}>
                    <FaFileAlt className={styles.fileIcon} />
                    <span>{existingSubmission.fileName}</span>
                    <a 
                      href={existingSubmission.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.downloadLink}
                    >
                      Descargar
                    </a>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ) : isOverdue ? (
          <Card title="Entrega No Disponible" className={styles.overdueNotice}>
            <div className={styles.overdueContent}>
              <h4>Tarea Vencida</h4>
              <p>La fecha límite para entregar esta tarea ya ha pasado.</p>
              <p>Fecha de vencimiento: {formatDate(assignment.dueDate)}</p>
            </div>
          </Card>
        ) : !canSubmit ? (
          <Card title="Entrega No Disponible" className={styles.unavailableNotice}>
            <div className={styles.unavailableContent}>
              <h4>Entrega No Disponible</h4>
              <p>Esta tarea no está disponible para entrega en este momento.</p>
            </div>
          </Card>
        ) : (
          <Card title="Realizar Entrega" className={styles.submissionForm}>
            <form onSubmit={handleSubmit}>
              {(assignment.submissionType === 'TEXT' || assignment.submissionType === 'BOTH') && (
                <div className={styles.textSubmission}>
                  <label className={styles.label}>
                    Respuesta {assignment.submissionType === 'TEXT' ? '*' : '(opcional)'}
                  </label>
                  <textarea
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    className={styles.textarea}
                    rows="8"
                    placeholder="Escribe tu respuesta aquí..."
                    required={assignment.submissionType === 'TEXT'}
                  />
                </div>
              )}

              {(assignment.submissionType === 'FILE' || assignment.submissionType === 'BOTH') && (
                <div className={styles.fileSubmission}>
                  <label className={styles.label}>
                    Archivo {assignment.submissionType === 'FILE' ? '*' : '(opcional)'}
                  </label>
                  
                  <div className={styles.fileUploadSection}>
                    <div
                      {...getRootProps()}
                      className={`${styles.dropzone} ${isDragActive ? styles.active : ''} ${selectedFile ? styles.hasFile : ''}`}
                    >
                      <input {...getInputProps()} />
                      {selectedFile ? (
                        <div className={styles.selectedFile}>
                          <FaFileAlt className={styles.fileIcon} />
                          <div className={styles.fileDetails}>
                            <span className={styles.fileName}>{selectedFile.name}</span>
                            <span className={styles.fileSize}>
                              {formatFileSize(selectedFile.size)}
                            </span>
                          </div>
                          <button
                            type="button"
                            className={styles.removeFile}
                            onClick={handleRemoveFile}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ) : (
                        <div className={styles.dropzoneContent}>
                          <FaUpload className={styles.uploadIcon} />
                          <p>
                            {isDragActive
                              ? 'Suelta el archivo aquí...'
                              : 'Arrastra un archivo aquí o haz clic para seleccionar'
                            }
                          </p>
                          <div className={styles.fileConstraints}>
                            <p>Extensiones permitidas: {assignment.allowedExtensions}</p>
                            <p>Tamaño máximo: {formatFileSize(assignment.maxFileSize)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.submissionActions}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  icon={<FaUpload />}
                  loading={isSubmitting}
                >
                  Entregar Tarea
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AssignmentSubmission;
