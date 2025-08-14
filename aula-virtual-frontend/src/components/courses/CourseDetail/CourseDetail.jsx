import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import Loading from '../../common/Loading/Loading';
import useAuth from '../../../hooks/useAuth';
import courseService from '../../../services/courseService';
import { formatStatus, formatDate } from '../../../utils/formatters';
import styles from './CourseDetail.module.css';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [units, setUnits] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { hasRole } = useAuth();

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const [courseData, unitsData, studentsData] = await Promise.all([
          courseService.getCourseById(id),
          courseService.getCourseUnits(id),
          hasRole('INSTRUCTOR') || hasRole('ADMIN') 
            ? courseService.getEnrolledStudents(id)
            : Promise.resolve([])
        ]);

        setCourse(courseData);
        setUnits(unitsData);
        setStudents(studentsData);
      } catch (error) {
        console.error('Error fetching course details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourseDetails();
    }
  }, [id, hasRole]);

  if (loading) {
    return <Loading message="Cargando detalles del curso..." />;
  }

  if (!course) {
    return (
      <div className={styles.error}>
        <p>Curso no encontrado</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.breadcrumb}>
          <Link to="/courses" className={styles.breadcrumbLink}>
            Cursos
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>{course.name}</span>
        </div>
        
        <div className={styles.actions}>
          {hasRole('INSTRUCTOR') && (
            <>
              <Button variant="outline" size="small">
                Editar Curso
              </Button>
              <Button variant="primary" size="small">
                Nueva Unidad
              </Button>
            </>
          )}
        </div>
      </div>

      <div className={styles.courseInfo}>
        <Card>
          <div className={styles.courseHeader}>
            <div className={styles.courseTitle}>
              <h1 className={styles.courseName}>{course.name}</h1>
              <p className={styles.courseCode}>{course.code}</p>
            </div>
            <span className={`${styles.status} ${styles[course.status?.toLowerCase()]}`}>
              {formatStatus(course.status)}
            </span>
          </div>

          {course.description && (
            <p className={styles.description}>{course.description}</p>
          )}

          <div className={styles.metadata}>
            <div className={styles.metadataItem}>
              <span className={styles.label}>Instructor:</span>
              <span>{course.instructor?.firstName} {course.instructor?.lastName}</span>
            </div>
            <div className={styles.metadataItem}>
              <span className={styles.label}>Créditos:</span>
              <span>{course.credits || 0}</span>
            </div>
            <div className={styles.metadataItem}>
              <span className={styles.label}>Periodo:</span>
              <span>{course.academicPeriod}</span>
            </div>
            {course.startDate && (
              <div className={styles.metadataItem}>
                <span className={styles.label}>Fecha de inicio:</span>
                <span>{formatDate(course.startDate)}</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className={styles.content}>
        <div className={styles.mainContent}>
          <Card title="Unidades del Curso">
            {units.length > 0 ? (
              <div className={styles.units}>
                {units.map(unit => (
                  <div key={unit.id} className={styles.unit}>
                    <h4 className={styles.unitTitle}>{unit.title}</h4>
                    {unit.description && (
                      <p className={styles.unitDescription}>{unit.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noData}>No hay unidades disponibles</p>
            )}
          </Card>
        </div>

        <div className={styles.sidebar}>
          <Card title="Navegación">
            <div className={styles.navigation}>
              <Link to={`/courses/${id}/assignments`} className={styles.navLink}>
                📝 Tareas
              </Link>
              <Link to={`/courses/${id}/exams`} className={styles.navLink}>
                📋 Exámenes
              </Link>
              <Link to={`/courses/${id}/forums`} className={styles.navLink}>
                💬 Foros
              </Link>
              <Link to={`/courses/${id}/resources`} className={styles.navLink}>
                📁 Recursos
              </Link>
            </div>
          </Card>

          {(hasRole('INSTRUCTOR') || hasRole('ADMIN')) && students.length > 0 && (
            <Card title="Estudiantes Inscritos">
              <div className={styles.students}>
                <p className={styles.studentsCount}>
                  Total: {students.length} estudiantes
                </p>
                <div className={styles.studentsList}>
                  {students.slice(0, 5).map(student => (
                    <div key={student.id} className={styles.student}>
                      {student.firstName} {student.lastName}
                    </div>
                  ))}
                  {students.length > 5 && (
                    <p className={styles.moreStudents}>
                      y {students.length - 5} más...
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
