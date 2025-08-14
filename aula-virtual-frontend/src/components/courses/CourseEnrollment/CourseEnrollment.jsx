import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Button from '../../common/Button/Button';
import Card from '../../common/Card/Card';
import Input from '../../common/Input/Input';
import Modal from '../../common/Modal/Modal';
import Loading from '../../common/Loading/Loading';
import { FaUserPlus, FaUserMinus, FaSearch, FaUsers, FaGraduationCap, FaEnvelope, FaPhone } from 'react-icons/fa';
import { courseService } from '../../../services/courseService';
import { userService } from '../../../services/userService';
import { toast } from 'react-toastify';
import styles from './CourseEnrollment.module.css';

const CourseEnrollment = ({ courseId, canManage }) => {
  const queryClient = useQueryClient();
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showUnenrollModal, setShowUnenrollModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableStudentsSearch, setAvailableStudentsSearch] = useState('');

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery(
    ['course-enrollments', courseId],
    () => courseService.getCourseEnrollments(courseId),
    {
      enabled: !!courseId
    }
  );

  const { data: availableStudents, isLoading: studentsLoading } = useQuery(
    ['available-students', courseId, availableStudentsSearch],
    () => userService.getAvailableStudentsForCourse(courseId, availableStudentsSearch),
    {
      enabled: showEnrollModal
    }
  );

  const enrollStudentMutation = useMutation(
    (studentId) => courseService.enrollStudent(courseId, studentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['course-enrollments', courseId]);
        queryClient.invalidateQueries(['available-students', courseId]);
        toast.success('Estudiante inscrito exitosamente');
        setShowEnrollModal(false);
      },
      onError: (error) => {
        toast.error('Error al inscribir estudiante');
      }
    }
  );

  const unenrollStudentMutation = useMutation(
    (studentId) => courseService.unenrollStudent(courseId, studentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['course-enrollments', courseId]);
        toast.success('Estudiante desinscrito exitosamente');
        setShowUnenrollModal(false);
        setSelectedStudent(null);
      },
      onError: (error) => {
        toast.error('Error al desinscribir estudiante');
      }
    }
  );

  const handleEnrollStudent = (studentId) => {
    enrollStudentMutation.mutate(studentId);
  };

  const handleUnenrollStudent = (student) => {
    setSelectedStudent(student);
    setShowUnenrollModal(true);
  };

  const confirmUnenrollStudent = () => {
    if (selectedStudent) {
      unenrollStudentMutation.mutate(selectedStudent.id);
    }
  };

  const filteredEnrollments = enrollments?.filter(enrollment =>
    enrollment.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.student.userCode.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusBadge = (status) => {
    const statusConfig = {
      'ENROLLED': { label: 'Inscrito', className: styles.statusEnrolled },
      'DROPPED': { label: 'Retirado', className: styles.statusDropped },
      'COMPLETED': { label: 'Completado', className: styles.statusCompleted }
    };

    const config = statusConfig[status] || statusConfig['ENROLLED'];

    return (
      <span className={`${styles.statusBadge} ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (enrollmentsLoading) {
    return <Loading text="Cargando estudiantes inscritos..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h3 className={styles.title}>Estudiantes Inscritos</h3>
          <div className={styles.statsInfo}>
            <div className={styles.statItem}>
              <FaUsers className={styles.statIcon} />
              <span>{enrollments?.length || 0} estudiantes</span>
            </div>
          </div>
        </div>
        {canManage && (
          <Button
            variant="primary"
            icon={<FaUserPlus />}
            onClick={() => setShowEnrollModal(true)}
          >
            Inscribir Estudiante
          </Button>
        )}
      </div>

      <div className={styles.searchSection}>
        <Input
          placeholder="Buscar estudiantes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<FaSearch />}
          className={styles.searchInput}
        />
      </div>

      {filteredEnrollments.length === 0 ? (
        <div className={styles.emptyState}>
          <FaGraduationCap className={styles.emptyIcon} />
          <h4>
            {searchTerm ? 'No se encontraron estudiantes' : 'No hay estudiantes inscritos'}
          </h4>
          <p>
            {searchTerm 
              ? 'No hay estudiantes que coincidan con la búsqueda.'
              : 'Aún no hay estudiantes inscritos en este curso.'
            }
          </p>
          {canManage && !searchTerm && (
            <Button
              variant="primary"
              icon={<FaUserPlus />}
              onClick={() => setShowEnrollModal(true)}
            >
              Inscribir Primer Estudiante
            </Button>
          )}
        </div>
      ) : (
        <div className={styles.studentsList}>
          {filteredEnrollments.map((enrollment) => (
            <Card key={enrollment.id} className={styles.studentCard}>
              <div className={styles.studentHeader}>
                <div className={styles.studentAvatar}>
                  {enrollment.student.profilePicture ? (
                    <img 
                      src={enrollment.student.profilePicture} 
                      alt={`${enrollment.student.firstName} ${enrollment.student.lastName}`}
                    />
                  ) : (
                    <span className={styles.avatarInitials}>
                      {enrollment.student.firstName.charAt(0)}
                      {enrollment.student.lastName.charAt(0)}
                    </span>
                  )}
                </div>
                
                <div className={styles.studentInfo}>
                  <h4 className={styles.studentName}>
                    {enrollment.student.firstName} {enrollment.student.lastName}
                  </h4>
                  <p className={styles.studentCode}>{enrollment.student.userCode}</p>
                  
                  <div className={styles.studentContact}>
                    <div className={styles.contactItem}>
                      <FaEnvelope className={styles.contactIcon} />
                      <span>{enrollment.student.email}</span>
                    </div>
                    {enrollment.student.phone && (
                      <div className={styles.contactItem}>
                        <FaPhone className={styles.contactIcon} />
                        <span>{enrollment.student.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className={styles.studentMeta}>
                  {getStatusBadge(enrollment.status)}
                  <div className={styles.enrollmentInfo}>
                    <p className={styles.enrollmentDate}>
                      Inscrito: {formatDate(enrollment.enrollmentDate)}
                    </p>
                    {enrollment.finalGrade && (
                      <p className={styles.finalGrade}>
                        Nota Final: {enrollment.finalGrade}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {canManage && (
                <div className={styles.studentActions}>
                  <Button
                    variant="outline"
                    size="small"
                    icon={<FaUserMinus />}
                    onClick={() => handleUnenrollStudent(enrollment.student)}
                  >
                    Desinscribir
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Enroll Student Modal */}
      <Modal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        title="Inscribir Estudiante"
        size="large"
      >
        <div className={styles.enrollModal}>
          <div className={styles.modalSearch}>
            <Input
              placeholder="Buscar estudiantes disponibles..."
              value={availableStudentsSearch}
              onChange={(e) => setAvailableStudentsSearch(e.target.value)}
              icon={<FaSearch />}
              fullWidth
            />
          </div>
          
          {studentsLoading ? (
            <Loading text="Buscando estudiantes..." />
          ) : (
            <div className={styles.availableStudentsList}>
              {availableStudents?.length === 0 ? (
                <div className={styles.noStudents}>
                  <p>No hay estudiantes disponibles para inscribir.</p>
                </div>
              ) : (
                availableStudents?.map((student) => (
                  <div key={student.id} className={styles.availableStudent}>
                    <div className={styles.studentAvatar}>
                      {student.profilePicture ? (
                        <img src={student.profilePicture} alt={`${student.firstName} ${student.lastName}`} />
                      ) : (
                        <span className={styles.avatarInitials}>
                          {student.firstName.charAt(0)}
                          {student.lastName.charAt(0)}
                        </span>
                      )}
                    </div>
                    
                    <div className={styles.studentInfo}>
                      <h5 className={styles.studentName}>
                        {student.firstName} {student.lastName}
                      </h5>
                      <p className={styles.studentCode}>{student.userCode}</p>
                      <p className={styles.studentEmail}>{student.email}</p>
                    </div>
                    
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => handleEnrollStudent(student.id)}
                      loading={enrollStudentMutation.isLoading}
                    >
                      Inscribir
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Unenroll Confirmation Modal */}
      <Modal
        isOpen={showUnenrollModal}
        onClose={() => setShowUnenrollModal(false)}
        title="Confirmar Desinscripción"
        size="small"
      >
        <div className={styles.unenrollConfirmation}>
          <p>
            ¿Estás seguro de que deseas desinscribir a{' '}
            <strong>
              {selectedStudent?.firstName} {selectedStudent?.lastName}
            </strong>{' '}
            del curso?
          </p>
          <p className={styles.unenrollWarning}>
            Esta acción eliminará todo el progreso del estudiante en el curso.
          </p>
          <div className={styles.modalActions}>
            <Button
              variant="outline"
              onClick={() => setShowUnenrollModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmUnenrollStudent}
              loading={unenrollStudentMutation.isLoading}
            >
              Desinscribir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CourseEnrollment;
