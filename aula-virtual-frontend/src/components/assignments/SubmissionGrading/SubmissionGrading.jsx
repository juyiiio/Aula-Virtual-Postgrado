import React, { useState, useEffect } from 'react';
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import Loading from '../../common/Loading/Loading';
import assignmentService from '../../../services/assignmentService';
import useNotification from '../../../hooks/useNotification';
import { formatDateTime } from '../../../utils/dateUtils';
import { formatFileSize } from '../../../utils/formatters';
import styles from './SubmissionGrading.module.css';

const SubmissionGrading = ({ assignmentId, assignment }) => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const { showError, showSuccess } = useNotification();

  useEffect(() => {
    fetchSubmissions();
  }, [assignmentId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const submissionsData = await assignmentService.getAssignmentSubmissions(assignmentId);
      setSubmissions(submissionsData);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSubmission = (submission) => {
    setSelectedSubmission(submission);
    setGrade(submission.grade || '');
    setFeedback(submission.feedback || '');
  };

  const handleGradeSubmission = async (e) => {
    e.preventDefault();

    if (!selectedSubmission) return;

    if (!grade || grade < 0 || grade > assignment.maxPoints) {
      showError(`La calificación debe estar entre 0 y ${assignment.maxPoints}`);
      return;
    }

    setGrading(true);
    try {
      const gradeData = {
        grade: parseFloat(grade),
        feedback: feedback.trim()
      };

      await assignmentService.gradeSubmission(assignmentId, selectedSubmission.id, gradeData);
      showSuccess('Calificación guardada exitosamente');
      
      // Actualizar la lista de entregas
      fetchSubmissions();
      
      // Actualizar la entrega seleccionada
      setSelectedSubmission({
        ...selectedSubmission,
        ...gradeData,
        status: 'GRADED',
        gradedAt: new Date().toISOString()
      });
    } catch (error) {
      const message = error?.response?.data?.message || 'Error al calificar la entrega';
      showError(message);
    } finally {
      setGrading(false);
    }
  };

  if (loading) {
    return <Loading message="Cargando entregas..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        <div className={styles.sidebar}>
          <Card title={`Entregas (${submissions.length})`}>
            {submissions.length > 0 ? (
              <div className={styles.submissionsList}>
                {submissions.map(submission => (
                  <div
                    key={submission.id}
                    className={`${styles.submissionItem} ${
                      selectedSubmission?.id === submission.id ? styles.selected : ''
                    }`}
                    onClick={() => handleSelectSubmission(submission)}
                  >
                    <div className={styles.studentInfo}>
                      <h4 className={styles.studentName}>
                        {submission.student.firstName} {submission.student.lastName}
                      </h4>
                      <p className={styles.studentCode}>{submission.student.userCode}</p>
                    </div>
                    
                    <div className={styles.submissionStatus}>
                      <span className={`${styles.status} ${styles[submission.status?.toLowerCase()]}`}>
                        {submission.status === 'SUBMITTED' ? 'Entregado' : 
                         submission.status === 'GRADED' ? 'Calificado' : 
                         submission.status === 'LATE' ? 'Tardío' : submission.status}
                      </span>
                      {submission.grade !== null && (
                        <span className={styles.grade}>
                          {submission.grade}/{assignment.maxPoints}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noSubmissions}>No hay entregas disponibles</p>
            )}
          </Card>
        </div>

        <div className={styles.mainContent}>
          {selectedSubmission ? (
            <div className={styles.submissionDetail}>
              <Card title="Detalles de la Entrega">
                <div className={styles.submissionHeader}>
                  <div className={styles.studentDetails}>
                    <h3>{selectedSubmission.student.firstName} {selectedSubmission.student.lastName}</h3>
                    <p>Código: {selectedSubmission.student.userCode}</p>
                    <p>Email: {selectedSubmission.student.email}</p>
                  </div>
                  
                  <div className={styles.submissionMeta}>
                    <p><strong>Fecha de entrega:</strong> {formatDateTime(selectedSubmission.submissionDate)}</p>
                    <p><strong>Estado:</strong> {selectedSubmission.status}</p>
                  </div>
                </div>

                {selectedSubmission.submissionText && (
                  <div className={styles.textSubmission}>
                    <h4>Texto de la Entrega:</h4>
                    <div className={styles.textContent}>
                      {selectedSubmission.submissionText}
                    </div>
                  </div>
                )}

                {selectedSubmission.fileUrl && (
                  <div className={styles.fileSubmission}>
                    <h4>Archivo Entregado:</h4>
                    <div className={styles.fileInfo}>
                      <p><strong>Nombre:</strong> {selectedSubmission.fileName}</p>
                      <a 
                        href={selectedSubmission.fileUrl} 
                        download 
                        className={styles.downloadLink}
                      >
                        Descargar archivo
                      </a>
                    </div>
                  </div>
                )}

                <form onSubmit={handleGradeSubmission} className={styles.gradingForm}>
                  <h4>Calificación</h4>
                  
                  <div className={styles.gradeInput}>
                    <Input
                      label={`Calificación (0 - ${assignment.maxPoints})`}
                      type="number"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      min="0"
                      max={assignment.maxPoints}
                      step="0.1"
                      required
                    />
                  </div>

                  <Input
                    label="Retroalimentación"
                    type="textarea"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Comentarios y retroalimentación para el estudiante..."
                    rows="4"
                  />

                  <div className={styles.gradingActions}>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={grading}
                    >
                      Guardar Calificación
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          ) : (
            <div className={styles.noSelection}>
              <Card>
                <div className={styles.emptyState}>
                  <p>Selecciona una entrega de la lista para calificar</p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionGrading;
