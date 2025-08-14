import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../../../context/AuthContext';
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import Loading from '../../common/Loading/Loading';
import CourseUnits from '../CourseUnits/CourseUnits';
import { FaArrowLeft, FaUsers, FaCalendarAlt, FaClock, FaEdit, FaPlay, FaBook, FaTasks, FaClipboardCheck, FaComments } from 'react-icons/fa';
import { courseService } from '../../../services/courseService';
import { toast } from 'react-toastify';
import styles from './CourseDetail.module.css';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: course, isLoading, refetch } = useQuery(
    ['course', id],
    () => courseService.getCourseById(id),
    {
      onError: (error) => {
        toast.error('Error al cargar el curso');
        navigate('/courses');
      }
    }
  );

  const canEdit = hasRole(['ADMIN']) || (hasRole(['INSTRUCTOR']) && course?.instructorId === user?.id);
  const isEnrolled = course?.enrollments?.some(e => e.studentId === user?.id);
  const canEnroll = hasRole(['STUDENT']) && !isEnrolled;

  const handleBack = () => {
    navigate('/courses');
  };

  const handleEdit = () => {
    navigate(`/courses/${id}/edit`);
  };

  const handleEnroll = async () => {
    try {
      await courseService.enrollStudent(id, user?.id);
      toast.success('Te has inscrito al curso exitosamente');
      refetch();
    } catch (error) {
      toast.error('Error al inscribirse al curso');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = () => {
    const statusClasses = {
      'ACTIVE': styles.statusActive,
      'INACTIVE': styles.statusInactive,
      'COMPLETED': styles.statusCompleted
    };

    const statusTexts = {
      'ACTIVE': 'Activo',
      'INACTIVE': 'Inactivo',
      'COMPLETED': 'Completado'
    };

    return (
      <span className={`${styles.statusBadge} ${statusClasses[course?.status]}`}>
        {statusTexts[course?.status]}
      </span>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: FaBook },
    { id: 'units', label: 'Unidades', icon: FaBook },
    { id: 'assignments', label: 'Tareas', icon: FaTasks },
    { id: 'exams', label: 'Exámenes', icon: FaClipboardCheck },
    { id: 'forums', label: 'Foros', icon: FaComments },
    { id: 'students', label: 'Estudiantes', icon: FaUsers }
  ];

  if (isLoading) {
    return <Loading text="Cargando detalles del curso..." />;
  }

  if (!course) {
    return (
      <div className={styles.notFound}>
        <h2>Curso no encontrado</h2>
        <p>El curso que buscas no existe o no tienes permisos para verlo.</p>
        <Button variant="primary" onClick={handleBack}>
          Volver a Cursos
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
          className={styles.backButton}
        >
          Volver
        </Button>
        
        <div className={styles.courseHeader}>
          <div className={styles.courseInfo}>
            <div className={styles.courseTitleSection}>
              <h1 className={styles.courseTitle}>{course.name}</h1>
              {getStatusBadge()}
            </div>
            <p className={styles.courseCode}>{course.code}</p>
            <p className={styles.courseDescription}>{course.description}</p>
          </div>
          
          <div className={styles.courseActions}>
            {canEnroll && (
              <Button
                variant="primary"
                icon={<FaPlay />}
                onClick={handleEnroll}
              >
                Inscribirse
              </Button>
            )}
            {canEdit && (
              <Button
                variant="outline"
                icon={<FaEdit />}
                onClick={handleEdit}
              >
                Editar Curso
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.courseStats}>
        <div className={styles.statItem}>
          <FaUsers className={styles.statIcon} />
          <div className={styles.statContent}>
            <span className={styles.statValue}>{course.enrollments?.length || 0}</span>
            <span className={styles.statLabel}>Estudiantes</span>
          </div>
        </div>
        
        <div className={styles.statItem}>
          <FaClock className={styles.statIcon} />
          <div className={styles.statContent}>
            <span className={styles.statValue}>{course.credits || 0}</span>
            <span className={styles.statLabel}>Créditos</span>
          </div>
        </div>
        
        {course.startDate && (
          <div className={styles.statItem}>
            <FaCalendarAlt className={styles.statIcon} />
            <div className={styles.statContent}>
              <span className={styles.statValue}>{formatDate(course.startDate)}</span>
              <span className={styles.statLabel}>Fecha de Inicio</span>
            </div>
          </div>
        )}
        
        {course.instructor && (
          <div className={styles.statItem}>
            <div className={styles.instructorAvatar}>
              {course.instructor.profilePicture ? (
                <img src={course.instructor.profilePicture} alt="Instructor" />
              ) : (
                course.instructor.firstName?.charAt(0)
              )}
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>
                {course.instructor.firstName} {course.instructor.lastName}
              </span>
              <span className={styles.statLabel}>Instructor</span>
            </div>
          </div>
        )}
      </div>

      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          {tabs.map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <IconComponent className={styles.tabIcon} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'overview' && (
          <div className={styles.overviewContent}>
            <Card title="Información del Curso">
              <div className={styles.courseDetails}>
                <div className={styles.detailSection}>
                  <h4>Descripción</h4>
                  <p>{course.description || 'Sin descripción disponible'}</p>
                </div>
                
                {course.academicPeriod && (
                  <div className={styles.detailSection}>
                    <h4>Período Académico</h4>
                    <p>{course.academicPeriod}</p>
                  </div>
                )}
                
                {course.groupNumber && (
                  <div className={styles.detailSection}>
                    <h4>Grupo</h4>
                    <p>{course.groupNumber}</p>
                  </div>
                )}
                
                {course.syllabusUrl && (
                  <div className={styles.detailSection}>
                    <h4>Sílabo</h4>
                    <a 
                      href={course.syllabusUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.syllabusLink}
                    >
                      Descargar Sílabo
                    </a>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'units' && (
          <CourseUnits courseId={id} canEdit={canEdit} />
        )}

        {activeTab === 'assignments' && (
          <div className={styles.tabPlaceholder}>
            <h3>Tareas</h3>
            <p>Lista de tareas del curso...</p>
          </div>
        )}

        {activeTab === 'exams' && (
          <div className={styles.tabPlaceholder}>
            <h3>Exámenes</h3>
            <p>Lista de exámenes del curso...</p>
          </div>
        )}

        {activeTab === 'forums' && (
          <div className={styles.tabPlaceholder}>
            <h3>Foros</h3>
            <p>Foros de discusión del curso...</p>
          </div>
        )}

        {activeTab === 'students' && (
          <div className={styles.tabPlaceholder}>
            <h3>Estudiantes</h3>
            <p>Lista de estudiantes inscritos...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
