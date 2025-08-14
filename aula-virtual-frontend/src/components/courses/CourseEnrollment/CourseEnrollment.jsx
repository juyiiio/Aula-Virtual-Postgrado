import React, { useState, useEffect } from 'react';
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import Loading from '../../common/Loading/Loading';
import Input from '../../common/Input/Input';
import Modal from '../../common/Modal/Modal';
import useAuth from '../../../hooks/useAuth';
import courseService from '../../../services/courseService';
import userService from '../../../services/userService';
import useNotification from '../../../hooks/useNotification';
import { formatDate } from '../../../utils/formatters';
import styles from './CourseEnrollment.module.css';

const CourseEnrollment = ({ courseId }) => {
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [enrollLoading, setEnrollLoading] = useState(false);
  const { hasRole } = useAuth();
  const { showError, showSuccess } = useNotification();

  useEffect(() => {
    fetchEnrollmentData();
  }, [courseId]);

  const fetchEnrollmentData = async () => {
    try {
      setLoading(true);
      const [enrolled, allStudents] = await Promise.all([
        courseService.getEnrolledStudents(courseId),
        userService.getStudents()
      ]);

      setEnrolledStudents(enrolled);
      
      const enrolledIds = enrolled.map(student => student.id);
      const available = allStudents.filter(student => !enrolledIds.includes(student.id));
      setAvailableStudents(available);
    } catch (error) {
      console.error('Error fetching enrollment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollStudent = async () => {
    if (!selectedStudent) return;

    setEnrollLoading(true);
    try {
      await courseService.enrollStudent(courseId, selectedStudent);
      showSuccess('Estudiante inscrito exitosamente');
      setShowModal(false);
      setSelectedStudent('');
      fetchEnrollmentData();
    } catch (error) {
      const message = error?.response?.data?.message || 'Error al inscribir estudiante';
      showError(message);
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleUnenrollStudent = async (studentId) => {
    if (!window.confirm('¿Estás seguro de desinscribir a este estudiante?')) {
      return;
    }

    try {
      await courseService.unenrollStudent(courseId, studentId);
      showSuccess('Estudiante desinscrito exitosamente');
      fetchEnrollmentData();
    } catch (error) {
      const message = error?.response?.data?.message || 'Error al desinscribir estudiante';
      showError(message);
    }
  };

  const filteredStudents = enrolledStudents.filter(student =>
    `${student.firstName} ${student.lastName} ${student.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loading message="Cargando estudiantes..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          Estudiantes Inscritos ({enrolledStudents.length})
        </h3>
        {hasRole('INSTRUCTOR') && (
          <Button
            onClick={() => setShowModal(true)}
            variant="primary"
            size="small"
          >
            Inscribir Estudiante
          </Button>
        )}
      </div>

      <div className={styles.searchContainer}>
        <Input
          placeholder="Buscar estudiantes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {filteredStudents.length > 0 ? (
        <div className={styles.students}>
          {filteredStudents.map(student => (
            <Card key={student.id} className={styles.studentCard}>
              <div className={styles.studentHeader}>
                <div className={styles.studentInfo}>
                  <h4 className={styles.studentName}>
                    {student.firstName} {student.lastName}
                  </h4>
                  <p className={styles.studentCode}>{student.userCode}</p>
                  <p className={styles.studentEmail}>{student.email}</p>
                </div>
                <div className={styles.studentMeta}>
                  <p className={styles.enrollmentDate}>
                    Inscrito: {formatDate(student.enrollmentDate)}
                  </p>
                  {hasRole('INSTRUCTOR') && (
                    <Button
                      variant="error"
                      size="small"
                      onClick={() => handleUnenrollStudent(student.id)}
                    >
                      Desinscribir
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>
            {searchTerm ? 'No se encontraron estudiantes' : 'No hay estudiantes inscritos'}
          </p>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Inscribir Estudiante"
      >
        <div className={styles.modalContent}>
          <div className={styles.selectContainer}>
            <label className={styles.selectLabel}>Seleccionar Estudiante:</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className={styles.select}
            >
              <option value="">Seleccione un estudiante</option>
              {availableStudents.map(student => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName} - {student.userCode}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.modalActions}>
            <Button
              variant="ghost"
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleEnrollStudent}
              loading={enrollLoading}
              disabled={!selectedStudent}
            >
              Inscribir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CourseEnrollment;
