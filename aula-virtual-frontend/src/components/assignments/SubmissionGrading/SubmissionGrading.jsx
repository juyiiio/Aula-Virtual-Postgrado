import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import Card from '../../common/Card/Card';
import Loading from '../../common/Loading/Loading';
import Modal from '../../common/Modal/Modal';
import { 
  FaArrowLeft, 
  FaSave, 
  FaTimes, 
  FaDownload, 
  FaFile, 
  FaUser, 
  FaCalendarAlt,
  FaGraduationCap,
  FaEye,
  FaEdit
} from 'react-icons/fa';
import { assignmentService } from '../../../services/assignmentService';
import { toast } from 'react-toastify';
import styles from './SubmissionGrading.module.css';

const SubmissionGrading = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const queryClient = useQueryClient();

  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [gradeForm, setGradeForm] = useState({
    grade: '',
    feedback: ''
  });
  const [errors, setErrors] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch assignment details
  const { data: assignment, isLoading: assignmentLoading } = useQuery(
    ['assignment', id],
    () => assignmentService.getAssignmentById(id),
    {
      onError: (error) => {
        toast.error('Error al cargar la tarea');
        navigate('/assignments');
      }
    }
  );

  // Fetch all submissions for this assignment
  const { data: submissions, isLoading: submissionsLoading, refetch } = useQuery(
    ['assignment-submissions', id],
    () => assignmentService.getAssignmentSubmissions(id),
    {
      enabled: !!assignment
    }
  );

  // Grade submission mutation
  const gradeSubmissionMutation = useMutation(
    ({ submissionId, gradeData }) => assignmentService.gradeSubmission(submissionId, gradeData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['assignment-submissions', id]);
        toast.success('Calificación guardada exitosamente');
        setShowGradeModal(false);
        setSelectedSubmission(null);
        setGradeForm({ grade: '', feedback: '' });
      },
      onError: (error) => {
        toast.error('Error al guardar la calificación');
      }
    }
  );

  const handleOpenGradeModal = (submission) => {
    setSelectedSubmission(submission);
    setGradeForm({
      grade: submission.grade || '',
      feedback: submission.feedback || ''
    });
    setErrors({});
    setShowGradeModal(true);
  };

  const handleCloseGradeModal = () => {
    setShowGradeModal(false);
    setSelectedSubmission(null);
    setGradeForm({ grade: '', feedback: '' });
    setErrors({});
  };

  const handleGradeFormChange = (e) => {
    const { name, value } = e.target;
    setGradeForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateGradeForm = () => {
    const newErrors = {};
    
    if (!gradeForm.grade || isNaN(gradeForm.grade)) {
      newErrors.grade = 'La calificación es requerida y debe ser un número';
    } else {
      const grade = parseFloat(gradeForm.grade);
      if (grade < 0 || grade > assignment?.maxPoints) {
        newErrors.grade = `La calificación debe estar entre 0 y ${assignment?.maxPoints}`;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitGrade = (e) => {
    e.preventDefault();
    
    if (!validateGradeForm()) return;
    
    gradeSubmissionMutation.mutate({
      submissionId: selectedSubmission.id,
      gradeData: {
        grade: parseFloat(gradeForm.grade),
        feedback: gradeForm.feedback.trim() || null
      }
    });
  };

  const handleDownloadFile = (submission) => {
    if (submission.fileUrl) {
      const link = document.createElement('a');
      link.href = submission.fileUrl;
      link.download = submission.fileName || 'submission';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getFilteredSubmissions = () => {
    if (!submissions) return [];
    
    switch (filterStatus) {
      case 'graded':
        return submissions.filter(sub => sub.grade !== null);
      case 'ungraded':
        return submissions.filter(sub => sub.grade === null);
      case 'late':
        return submissions.filter(sub => 
          new Date(sub.submissionDate) > new Date(assignment?.dueDate)
        );
      default:
        return submissions;
    }
  };

  const getSubmissionStats = () => {
    if (!submissions) return { total: 0, graded: 0, ungraded: 0, late: 0 };
    
    const total = submissions.length;
    const graded = submissions.filter(sub => sub.grade !== null).length;
    const ungraded = submissions.filter(sub => sub.grade === null).length;
    const late = submissions.filter(sub => 
      new Date(sub.submissionDate) > new Date(assignment?.dueDate)
    ).length;
    
    return { total, graded, ungraded, late };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isLateSubmission = (submission) => {
    return new Date(submission.submissionDate) > new Date(assignment?.dueDate);
  };

  if (assignmentLoading || submissionsLoading) {
    return <Loading text="Cargando entregas..." />;
  }

  if (!assignment) {
    return (
      <div className={styles.notFound}>
        <h2>Tarea no encontrada</h2>
        <p>La tarea que buscas no existe o no tienes permisos para verla.</p>
        <Button variant="primary" onClick={() => navigate('/assignments')}>
          Volver a Tareas
        </Button>
      </div>
    );
  }

  // Check permissions
  if (!hasRole(['ADMIN']) && assignment.courseInstructorId !== user?.id) {
    return (
      <div className={styles.noPermission}>
        <h2>Sin permisos</h2>
        <p>No tienes permisos para calificar esta tarea.</p>
        <Button variant="primary" onClick={() => navigate('/assignments')}>
          Volver a Tareas
        </Button>
      </div>
    );
  }

  const filteredSubmissions = getFilteredSubmissions();
  const stats = getSubmissionStats();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          variant="ghost"
          icon={<FaArrowLeft />}
          onClick={() => navigate('/assignments')}
        >
          Volver
        </Button>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Calificar: {assignment.title}</h1>
          <p className={styles.courseName}>{assignment.course?.name}</p>
        </div>
      </div>

      <div className={styles.assignmentSummary}>
        <Card>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Fecha límite:</span>
              <span className={styles.summaryValue}>
                {formatDate(assignment.dueDate)}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Puntos máximos:</span>
              <span className={styles.summaryValue}>{assignment.maxPoints}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Tipo de entrega:</span>
              <span className={styles.summaryValue}>
                {assignment.submissionType === 'FILE' && 'Solo archivo'}
                {assignment.submissionType === 'TEXT' && 'Solo texto'}
                {assignment.submissionType === 'BOTH' && 'Archivo y texto'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div className={styles.statsSection}>
        <Card title="Estadísticas de Entregas">
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{stats.total}</div>
              <div className={styles.statLabel}>Total de entregas</div>
            </div>
            <div className={styles.statItem}>
              <div className={`${styles.statValue} ${styles.graded}`}>{stats.graded}</div>
              <div className={styles.statLabel}>Calificadas</div>
            </div>
            <div className={styles.statItem}>
              <div className={`${styles.statValue} ${styles.ungraded}`}>{stats.ungraded}</div>
              <div className={styles.statLabel}>Sin calificar</div>
            </div>
            <div className={styles.statItem}>
              <div className={`${styles.statValue} ${styles.late}`}>{stats.late}</div>
              <div className={styles.statLabel}>Tardías</div>
            </div>
          </div>
        </Card>
      </div>

      <div className={styles.submissionsSection}>
        <Card>
          <div className={styles.submissionsHeader}>
            <h3>Entregas de Estudiantes</h3>
            <div className={styles.filters}>
              <button
                className={`${styles.filterButton} ${filterStatus === 'all' ? styles.active : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                Todas ({stats.total})
              </button>
              <button
                className={`${styles.filterButton} ${filterStatus === 'ungraded' ? styles.active : ''}`}
                onClick={() => setFilterStatus('ungraded')}
              >
                Sin calificar ({stats.ungraded})
              </button>
              <button
                className={`${styles.filterButton} ${filterStatus === 'graded' ? styles.active : ''}`}
                onClick={() => setFilterStatus('graded')}
              >
                Calificadas ({stats.graded})
              </button>
              <button
                className={`${styles.filterButton} ${filterStatus === 'late' ? styles.active : ''}`}
                onClick={() => setFilterStatus('late')}
              >
                Tardías ({stats.late})
              </button>
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className={styles.emptyState}>
              <FaGraduationCap className={styles.emptyIcon} />
              <h4>No hay entregas</h4>
              <p>
                {filterStatus === 'all' 
                  ? 'Aún no hay entregas para esta tarea.'
                  : 'No hay entregas que coincidan con el filtro seleccionado.'
                }
              </p>
            </div>
          ) : (
            <div className={styles.submissionsList}>
              {filteredSubmissions.map((submission) => (
                <div key={submission.id} className={styles.submissionCard}>
                  <div className={styles.submissionHeader}>
                    <div className={styles.studentInfo}>
                      <div className={styles.studentAvatar}>
                        {submission.student.profilePicture ? (
                          <img 
                            src={submission.student.profilePicture} 
                            alt={`${submission.student.firstName} ${submission.student.lastName}`}
                          />
                        ) : (
                          <FaUser />
                        )}
                      </div>
                      <div className={styles.studentDetails}>
                        <h4 className={styles.studentName}>
                          {submission.student.firstName} {submission.student.lastName}
                        </h4>
                        <p className={styles.studentCode}>{submission.student.userCode}</p>
                      </div>
                    </div>
                    
                    <div className={styles.submissionMeta}>
                      <div className={styles.submissionDate}>
                        <FaCalendarAlt className={styles.metaIcon} />
                        <span>Entregado: {formatDate(submission.submissionDate)}</span>
                      </div>
                      {isLateSubmission(submission) && (
                        <span className={styles.lateTag}>Tardía</span>
                      )}
                      {submission.grade !== null && (
                        <span className={styles.gradeTag}>
                          {submission.grade}/{assignment.maxPoints}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.submissionContent}>
                    {submission.submissionText && (
                      <div className={styles.textSubmission}>
                        <h5>Texto de la entrega:</h5>
                        <div className={styles.textContent}>
                          {submission.submissionText.substring(0, 200)}
                          {submission.submissionText.length > 200 && '...'}
                        </div>
                      </div>
                    )}

                    {submission.fileUrl && (
                      <div className={styles.fileSubmission}>
                        <h5>Archivo entregado:</h5>
                        <div className={styles.fileInfo}>
                          <div className={styles.fileDetails}>
                            <FaFile className={styles.fileIcon} />
                            <span>{submission.fileName}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="small"
                            icon={<FaDownload />}
                            onClick={() => handleDownloadFile(submission)}
                          >
                            Descargar
                          </Button>
                        </div>
                      </div>
                    )}

                    {submission.feedback && (
                      <div className={styles.existingFeedback}>
                        <h5>Comentarios:</h5>
                        <p>{submission.feedback}</p>
                      </div>
                    )}
                  </div>

                  <div className={styles.submissionActions}>
                    <Button
                      variant="outline"
                      size="small"
                      icon={<FaEye />}
                      onClick={() => {/* View full submission */}}
                    >
                      Ver Completa
                    </Button>
                    <Button
                      variant="primary"
                      size="small"
                      icon={submission.grade !== null ? <FaEdit /> : <FaGraduationCap />}
                      onClick={() => handleOpenGradeModal(submission)}
                    >
                      {submission.grade !== null ? 'Editar Calificación' : 'Calificar'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Grading Modal */}
      <Modal
        isOpen={showGradeModal}
        onClose={handleCloseGradeModal}
        title={`Calificar: ${selectedSubmission?.student.firstName} ${selectedSubmission?.student.lastName}`}
        size="large"
      >
        {selectedSubmission && (
          <div className={styles.gradeModal}>
            <div className={styles.submissionPreview}>
              <div className={styles.studentInfoModal}>
                <div className={styles.studentAvatar}>
                  {selectedSubmission.student.profilePicture ? (
                    <img 
                      src={selectedSubmission.student.profilePicture} 
                      alt={`${selectedSubmission.student.firstName} ${selectedSubmission.student.lastName}`}
                    />
                  ) : (
                    <FaUser />
                  )}
                </div>
                <div>
                  <h4>{selectedSubmission.student.firstName} {selectedSubmission.student.lastName}</h4>
                  <p>{selectedSubmission.student.userCode}</p>
                  <p>Entregado: {formatDate(selectedSubmission.submissionDate)}</p>
                  {isLateSubmission(selectedSubmission) && (
                    <span className={styles.lateTag}>Entrega tardía</span>
                  )}
                </div>
              </div>

              {selectedSubmission.submissionText && (
                <div className={styles.modalTextSubmission}>
                  <h5>Texto de la entrega:</h5>
                  <div className={styles.modalTextContent}>
                    {selectedSubmission.submissionText}
                  </div>
                </div>
              )}

              {selectedSubmission.fileUrl && (
                <div className={styles.modalFileSubmission}>
                  <h5>Archivo entregado:</h5>
                  <div className={styles.fileInfo}>
                    <div className={styles.fileDetails}>
                      <FaFile className={styles.fileIcon} />
                      <span>{selectedSubmission.fileName}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="small"
                      icon={<FaDownload />}
                      onClick={() => handleDownloadFile(selectedSubmission)}
                    >
                      Descargar
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmitGrade} className={styles.gradeForm}>
              <div className={styles.gradeInputSection}>
                <Input
                  label={`Calificación (0 - ${assignment.maxPoints})`}
                  type="number"
                  name="grade"
                  value={gradeForm.grade}
                  onChange={handleGradeFormChange}
                  error={errors.grade}
                  min="0"
                  max={assignment.maxPoints}
                  step="0.1"
                  required
                  fullWidth
                />
              </div>

              <div className={styles.feedbackSection}>
                <label className={styles.feedbackLabel}>
                  Comentarios (opcional)
                </label>
                <textarea
                  name="feedback"
                  value={gradeForm.feedback}
                  onChange={handleGradeFormChange}
                  className={styles.feedbackTextarea}
                  rows="4"
                  placeholder="Proporciona comentarios sobre la entrega del estudiante..."
                />
              </div>

              <div className={styles.modalActions}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseGradeModal}
                  disabled={gradeSubmissionMutation.isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={gradeSubmissionMutation.isLoading}
                >
                  Guardar Calificación
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SubmissionGrading;
