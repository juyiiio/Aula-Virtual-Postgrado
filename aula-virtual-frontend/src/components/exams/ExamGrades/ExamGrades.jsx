import React, { useState, useEffect } from 'react';
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import Loading from '../../common/Loading/Loading';
import examService from '../../../services/examService';
import useAuth from '../../../hooks/useAuth';
import useNotification from '../../../hooks/useNotification';
import { formatDateTime } from '../../../utils/dateUtils';
import { formatGrade } from '../../../utils/formatters';
import styles from './ExamGrades.module.css';

const ExamGrades = ({ examId, exam }) => {
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [gradeValue, setGradeValue] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { hasRole } = useAuth();
  const { showError, showSuccess } = useNotification();

  useEffect(() => {
    fetchGrades();
  }, [examId]);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const gradesData = await examService.getExamGrades(examId);
      setGrades(gradesData);
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGrade = (grade) => {
    setSelectedGrade(grade);
    setGradeValue(grade.grade || '');
    setFeedback(grade.feedback || '');
  };

  const handleGradeStudent = async (e) => {
    e.preventDefault();

    if (!selectedGrade) return;

    if (!gradeValue || gradeValue < 0 || gradeValue > exam.maxPoints) {
      showError(`La calificación debe estar entre 0 y ${exam.maxPoints}`);
      return;
    }

    setGrading(true);
    try {
      const gradeData = {
        grade: parseFloat(gradeValue),
        feedback: feedback.trim()
      };

      await examService.gradeExam(examId, selectedGrade.student.id, gradeData);
      showSuccess('Calificación guardada exitosamente');
      
      fetchGrades();
      
      setSelectedGrade({
        ...selectedGrade,
        ...gradeData,
        status: 'GRADED',
        gradedAt: new Date().toISOString()
      });
    } catch (error) {
      const message = error?.response?.data?.message || 'Error al calificar el examen';
      showError(message);
    } finally {
      setGrading(false);
    }
  };

  const filteredGrades = grades.filter(grade =>
    `${grade.student.firstName} ${grade.student.lastName} ${grade.student.userCode}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'NOT_STARTED': return 'gray';
      case 'IN_PROGRESS': return 'orange';
      case 'COMPLETED': return 'blue';
      case 'GRADED': return 'green';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'NOT_STARTED': return 'No iniciado';
      case 'IN_PROGRESS': return 'En progreso';
      case 'COMPLETED': return 'Completado';
      case 'GRADED': return 'Calificado';
      default: return status;
    }
  };

  if (loading) {
    return <Loading message="Cargando calificaciones..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        <div className={styles.sidebar}>
          <Card title={`Estudiantes (${grades.length})`}>
            <div className={styles.searchContainer}>
              <Input
                placeholder="Buscar estudiante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {filteredGrades.length > 0 ? (
              <div className={styles.gradesList}>
                {filteredGrades.map(grade => (
                  <div
                    key={grade.id}
                    className={`${styles.gradeItem} ${
                      selectedGrade?.id === grade.id ? styles.selected : ''
                    }`}
                    onClick={() => handleSelectGrade(grade)}
                  >
                    <div className={styles.studentInfo}>
                      <h4 className={styles.studentName}>
                        {grade.student.firstName} {grade.student.lastName}
                      </h4>
                      <p className={styles.studentCode}>{grade.student.userCode}</p>
                    </div>
                    
                    <div className={styles.gradeStatus}>
                      <span 
                        className={styles.status}
                        style={{ backgroundColor: getStatusColor(grade.status) }}
                      >
                        {getStatusText(grade.status)}
                      </span>
                      {grade.grade !== null && (
                        <span className={styles.gradeValue}>
                          {formatGrade(grade.grade, exam.maxPoints)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noGrades}>No hay estudiantes</p>
            )}
          </Card>
        </div>

        <div className={styles.mainContent}>
          {selectedGrade ? (
            <div className={styles.gradeDetail}>
              <Card title="Calificación del Estudiante">
                <div className={styles.studentHeader}>
                  <div className={styles.studentDetails}>
                    <h3>{selectedGrade.student.firstName} {selectedGrade.student.lastName}</h3>
                    <p>Código: {selectedGrade.student.userCode}</p>
                    <p>Email: {selectedGrade.student.email}</p>
                  </div>
                  
                  <div className={styles.examMeta}>
                    {selectedGrade.startTime && (
                      <p><strong>Inicio:</strong> {formatDateTime(selectedGrade.startTime)}</p>
                    )}
                    {selectedGrade.endTime && (
                      <p><strong>Fin:</strong> {formatDateTime(selectedGrade.endTime)}</p>
                    )}
                    <p><strong>Estado:</strong> {getStatusText(selectedGrade.status)}</p>
                  </div>
                </div>

                {selectedGrade.status === 'COMPLETED' || selectedGrade.status === 'GRADED' ? (
                  <form onSubmit={handleGradeStudent} className={styles.gradingForm}>
                    <h4>Calificar Examen</h4>
                    
                    <div className={styles.gradeInput}>
                      <Input
                        label={`Calificación (0 - ${exam.maxPoints})`}
                        type="number"
                        value={gradeValue}
                        onChange={(e) => setGradeValue(e.target.value)}
                        min="0"
                        max={exam.maxPoints}
                        step="0.1"
                        required
                        disabled={!hasRole('INSTRUCTOR')}
                      />
                    </div>

                    <Input
                      label="Retroalimentación"
                      type="textarea"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Comentarios para el estudiante..."
                      rows="4"
                      disabled={!hasRole('INSTRUCTOR')}
                    />

                    {hasRole('INSTRUCTOR') && (
                      <div className={styles.gradingActions}>
                        <Button
                          type="submit"
                          variant="primary"
                          loading={grading}
                        >
                          Guardar Calificación
                        </Button>
                      </div>
                    )}

                    {selectedGrade.status === 'GRADED' && (
                      <div className={styles.gradedInfo}>
                        <p><strong>Calificado el:</strong> {formatDateTime(selectedGrade.gradedAt)}</p>
                        <p><strong>Calificación final:</strong> {formatGrade(selectedGrade.grade, exam.maxPoints)}</p>
                      </div>
                    )}
                  </form>
                ) : (
                  <div className={styles.notCompleted}>
                    <p>El estudiante aún no ha completado el examen.</p>
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <div className={styles.noSelection}>
              <Card>
                <div className={styles.emptyState}>
                  <p>Selecciona un estudiante de la lista para ver o editar su calificación</p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamGrades;
