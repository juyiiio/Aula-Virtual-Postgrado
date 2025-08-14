import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../common/Button/Button';
import Card from '../../common/Card/Card';
import Loading from '../../common/Loading/Loading';
import Input from '../../common/Input/Input';
import Modal from '../../common/Modal/Modal';
import { 
  FaArrowLeft, 
  FaDownload, 
  FaEye, 
  FaEdit,
  FaSearch,
  FaFilter,
  FaChartBar,
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimesCircle
} from 'react-icons/fa';
import { examService } from '../../../services/examService';
import { toast } from 'react-toastify';
import styles from './ExamGrades.module.css';

const ExamGrades = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [gradeAdjustment, setGradeAdjustment] = useState('');
  const [feedbackText, setFeedbackText] = useState('');

  // Fetch exam details
  const { data: exam, isLoading: examLoading } = useQuery(
    ['exam-grades', id],
    () => examService.getExamWithGrades(id),
    {
      onError: (error) => {
        toast.error('Error al cargar las calificaciones');
        navigate('/exams');
      }
    }
  );

  // Adjust grade mutation
  const adjustGradeMutation = useMutation(
    ({ attemptId, adjustedScore, feedback }) => 
      examService.adjustExamGrade(attemptId, { adjustedScore, feedback }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['exam-grades', id]);
        toast.success('Calificación ajustada exitosamente');
        setShowGradeModal(false);
        setSelectedAttempt(null);
        setGradeAdjustment('');
        setFeedbackText('');
      },
      onError: (error) => {
        toast.error('Error al ajustar la calificación');
      }
    }
  );

  const handleViewAttempt = (attempt) => {
    navigate(`/exams/${id}/attempt/${attempt.id}`);
  };

  const handleAdjustGrade = (attempt) => {
    setSelectedAttempt(attempt);
    setGradeAdjustment(attempt.adjustedScore || attempt.score);
    setFeedbackText(attempt.feedback || '');
    setShowGradeModal(true);
  };

  const handleExportGrades = async () => {
    try {
      await examService.exportExamGrades(id);
      toast.success('Calificaciones exportadas exitosamente');
    } catch (error) {
      toast.error('Error al exportar calificaciones');
    }
  };

  const submitGradeAdjustment = () => {
    if (!gradeAdjustment || isNaN(gradeAdjustment)) {
      toast.error('Ingrese una calificación válida');
      return;
    }

    const adjustedScore = parseFloat(gradeAdjustment);
    if (adjustedScore < 0 || adjustedScore > exam.totalPoints) {
      toast.error(`La calificación debe estar entre 0 y ${exam.totalPoints}`);
      return;
    }

    adjustGradeMutation.mutate({
      attemptId: selectedAttempt.id,
      adjustedScore,
      feedback: feedbackText.trim() || null
    });
  };

  const getFilteredAttempts = () => {
    if (!exam?.attempts) return [];
    
    let filtered = exam.attempts;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(attempt =>
        attempt.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attempt.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attempt.student.userCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    switch (statusFilter) {
      case 'completed':
        filtered = filtered.filter(attempt => attempt.submittedAt);
        break;
      case 'in_progress':
        filtered = filtered.filter(attempt => !attempt.submittedAt && attempt.startedAt);
        break;
      case 'not_started':
        filtered = filtered.filter(attempt => !attempt.startedAt);
        break;
      default:
        break;
    }
    
    return filtered.sort((a, b) => {
      if (a.student.lastName < b.student.lastName) return -1;
      if (a.student.lastName > b.student.lastName) return 1;
      return 0;
    });
  };

  const getExamStatistics = () => {
    const attempts = exam?.attempts?.filter(att => att.submittedAt) || [];
    const scores = attempts.map(att => att.adjustedScore || att.score).filter(score => score !== null);
    
    if (scores.length === 0) {
      return {
        totalAttempts: attempts.length,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passedCount: 0,
        passRate: 0
      };
    }
    
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const passed = scores.filter(score => score >= exam.passingScore).length;
    
    return {
      totalAttempts: attempts.length,
      averageScore: Math.round(average * 100) / 100,
      highestScore: highest,
      lowestScore: lowest,
      passedCount: passed,
      passRate: Math.round((passed / attempts.length) * 100)
    };
  };

  const getStatusBadge = (attempt) => {
    if (!attempt.startedAt) {
      return <span className={`${styles.statusBadge} ${styles.notStarted}`}>No iniciado</span>;
    }
    
    if (!attempt.submittedAt) {
      return <span className={`${styles.statusBadge} ${styles.inProgress}`}>En progreso</span>;
    }
    
    const score = attempt.adjustedScore || attempt.score;
    const passed = score >= exam.passingScore;
    
    return (
      <span className={`${styles.statusBadge} ${passed ? styles.passed : styles.failed}`}>
        {passed ? 'Aprobado' : 'Desaprobado'}
      </span>
    );
  };

  const getStatusIcon = (attempt) => {
    if (!attempt.startedAt) {
      return <FaTimesCircle className={styles.notStartedIcon} />;
    }
    
    if (!attempt.submittedAt) {
      return <FaClock className={styles.inProgressIcon} />;
    }
    
    const score = attempt.adjustedScore || attempt.score;
    const passed = score >= exam.passingScore;
    
    return passed ? 
      <FaCheckCircle className={styles.passedIcon} /> : 
      <FaExclamationCircle className={styles.failedIcon} />;
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (examLoading) {
    return <Loading text="Cargando calificaciones..." />;
  }

  if (!exam) {
    return (
      <div className={styles.notFound}>
        <h2>Examen no encontrado</h2>
        <p>El examen que buscas no existe o no tienes permisos para verlo.</p>
        <Button variant="primary" onClick={() => navigate('/exams')}>
          Volver a Exámenes
        </Button>
      </div>
    );
  }

  // Check permissions
  if (!hasRole(['ADMIN']) && exam.courseInstructorId !== user?.id) {
    return (
      <div className={styles.noPermission}>
        <h2>Sin permisos</h2>
        <p>No tienes permisos para ver las calificaciones de este examen.</p>
        <Button variant="primary" onClick={() => navigate('/exams')}>
          Volver a Exámenes
        </Button>
      </div>
    );
  }

  const filteredAttempts = getFilteredAttempts();
  const statistics = getExamStatistics();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          variant="ghost"
          icon={<FaArrowLeft />}
          onClick={() => navigate('/exams')}
        >
          Volver
        </Button>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Calificaciones: {exam.title}</h1>
          <p className={styles.courseName}>{exam.course?.name}</p>
        </div>
        <div className={styles.headerActions}>
          <Button
            variant="outline"
            icon={<FaDownload />}
            onClick={handleExportGrades}
          >
            Exportar
          </Button>
        </div>
      </div>

      <div className={styles.statisticsSection}>
        <Card title="Estadísticas del Examen">
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <FaUsers />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{statistics.totalAttempts}</div>
                <div className={styles.statLabel}>Intentos completados</div>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <FaChartBar />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{statistics.averageScore}</div>
                <div className={styles.statLabel}>Promedio</div>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <FaCheckCircle />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{statistics.passRate}%</div>
                <div className={styles.statLabel}>Tasa de aprobación</div>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <FaExclamationCircle />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>
                  {statistics.highestScore} / {statistics.lowestScore}
                </div>
                <div className={styles.statLabel}>Mayor / Menor</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className={styles.gradesSection}>
        <Card>
          <div className={styles.gradesHeader}>
            <h3>Calificaciones de Estudiantes</h3>
            <div className={styles.filters}>
              <div className={styles.searchFilter}>
                <Input
                  placeholder="Buscar estudiantes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<FaSearch />}
                />
              </div>
              
              <div className={styles.statusFilters}>
                <button
                  className={`${styles.filterButton} ${statusFilter === 'all' ? styles.active : ''}`}
                  onClick={() => setStatusFilter('all')}
                >
                  Todos
                </button>
                <button
                  className={`${styles.filterButton} ${statusFilter === 'completed' ? styles.active : ''}`}
                  onClick={() => setStatusFilter('completed')}
                >
                  Completados
                </button>
                <button
                  className={`${styles.filterButton} ${statusFilter === 'in_progress' ? styles.active : ''}`}
                  onClick={() => setStatusFilter('in_progress')}
                >
                  En progreso
                </button>
                <button
                  className={`${styles.filterButton} ${statusFilter === 'not_started' ? styles.active : ''}`}
                  onClick={() => setStatusFilter('not_started')}
                >
                  No iniciados
                </button>
              </div>
            </div>
          </div>

          <div className={styles.gradesTable}>
            <div className={styles.tableHeader}>
              <div className={styles.headerCell}>Estudiante</div>
              <div className={styles.headerCell}>Estado</div>
              <div className={styles.headerCell}>Calificación</div>
              <div className={styles.headerCell}>Tiempo</div>
              <div className={styles.headerCell}>Fecha</div>
              <div className={styles.headerCell}>Acciones</div>
            </div>

            <div className={styles.tableBody}>
              {filteredAttempts.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No se encontraron estudiantes con los filtros aplicados.</p>
                </div>
              ) : (
                filteredAttempts.map(attempt => (
                  <div key={attempt.id} className={styles.tableRow}>
                    <div className={styles.studentCell}>
                      <div className={styles.studentInfo}>
                        <div className={styles.studentAvatar}>
                          {attempt.student.profilePicture ? (
                            <img 
                              src={attempt.student.profilePicture} 
                              alt={`${attempt.student.firstName} ${attempt.student.lastName}`}
                            />
                          ) : (
                            <span>
                              {attempt.student.firstName.charAt(0)}
                              {attempt.student.lastName.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className={styles.studentDetails}>
                          <div className={styles.studentName}>
                            {attempt.student.firstName} {attempt.student.lastName}
                          </div>
                          <div className={styles.studentCode}>
                            {attempt.student.userCode}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.statusCell}>
                      <div className={styles.statusContent}>
                        {getStatusIcon(attempt)}
                        {getStatusBadge(attempt)}
                      </div>
                    </div>
                    
                    <div className={styles.gradeCell}>
                      {attempt.submittedAt ? (
                        <div className={styles.gradeContent}>
                          <div className={styles.score}>
                            {attempt.adjustedScore || attempt.score}/{exam.totalPoints}
                          </div>
                          <div className={styles.percentage}>
                            {Math.round(((attempt.adjustedScore || attempt.score) / exam.totalPoints) * 100)}%
                          </div>
                        </div>
                      ) : (
                        <span className={styles.noScore}>-</span>
                      )}
                    </div>
                    
                    <div className={styles.timeCell}>
                      {attempt.timeSpent ? formatDuration(attempt.timeSpent) : '-'}
                    </div>
                    
                    <div className={styles.dateCell}>
                      {attempt.submittedAt ? formatDateTime(attempt.submittedAt) : 
                       attempt.startedAt ? formatDateTime(attempt.startedAt) : '-'}
                    </div>
                    
                    <div className={styles.actionsCell}>
                      <div className={styles.actionButtons}>
                        {attempt.submittedAt && (
                          <>
                            <Button
                              variant="ghost"
                              size="small"
                              icon={<FaEye />}
                              onClick={() => handleViewAttempt(attempt)}
                            >
                              Ver
                            </Button>
                            <Button
                              variant="ghost"
                              size="small"
                              icon={<FaEdit />}
                              onClick={() => handleAdjustGrade(attempt)}
                            >
                              Ajustar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Grade Adjustment Modal */}
      <Modal
        isOpen={showGradeModal}
        onClose={() => setShowGradeModal(false)}
        title={`Ajustar Calificación - ${selectedAttempt?.student.firstName} ${selectedAttempt?.student.lastName}`}
        size="medium"
      >
        {selectedAttempt && (
          <div className={styles.gradeModal}>
            <div className={styles.currentGrade}>
              <h4>Calificación Actual</h4>
              <div className={styles.gradeDisplay}>
                <span className={styles.currentScore}>
                  {selectedAttempt.adjustedScore || selectedAttempt.score}/{exam.totalPoints}
                </span>
                <span className={styles.currentPercentage}>
                  ({Math.round(((selectedAttempt.adjustedScore || selectedAttempt.score) / exam.totalPoints) * 100)}%)
                </span>
              </div>
            </div>

            <div className={styles.adjustmentForm}>
              <Input
                label={`Nueva Calificación (0 - ${exam.totalPoints})`}
                type="number"
                value={gradeAdjustment}
                onChange={(e) => setGradeAdjustment(e.target.value)}
                min="0"
                max={exam.totalPoints}
                step="0.1"
                fullWidth
                required
              />

              <div className={styles.feedbackSection}>
                <label className={styles.feedbackLabel}>
                  Comentarios para el estudiante (opcional)
                </label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className={styles.feedbackTextarea}
                  rows="4"
                  placeholder="Explica el motivo del ajuste de calificación..."
                />
              </div>

              <div className={styles.modalActions}>
                <Button
                  variant="outline"
                  onClick={() => setShowGradeModal(false)}
                  disabled={adjustGradeMutation.isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={submitGradeAdjustment}
                  loading={adjustGradeMutation.isLoading}
                >
                  Guardar Ajuste
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ExamGrades;
