import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../../../context/AuthContext';
import StatsCard from '../StatsCard/StatsCard';
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import Loading from '../../common/Loading/Loading';
import { FaBook, FaTasks, FaUsers, FaClipboardCheck, FaPlus, FaCalendarAlt } from 'react-icons/fa';
import { courseService } from '../../../services/courseService';
import { assignmentService } from '../../../services/assignmentService';
import { examService } from '../../../services/examService';
import styles from './InstructorDashboard.module.css';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    myCourses: 0,
    myAssignments: 0,
    myExams: 0,
    totalStudents: 0
  });

  const { data: courses, isLoading: coursesLoading } = useQuery(
    ['instructor-courses', user?.id],
    () => courseService.getCoursesByInstructor(user?.id),
    {
      enabled: !!user?.id,
      onSuccess: (data) => {
        setStats(prev => ({
          ...prev,
          myCourses: data.length || 0,
          totalStudents: data.reduce((total, course) => 
            total + (course.enrollments?.length || 0), 0
          )
        }));
      }
    }
  );

  const { data: assignments, isLoading: assignmentsLoading } = useQuery(
    ['instructor-assignments', user?.id],
    () => assignmentService.getAssignmentsByInstructor(user?.id),
    {
      enabled: !!user?.id,
      onSuccess: (data) => {
        setStats(prev => ({
          ...prev,
          myAssignments: data.length || 0
        }));
      }
    }
  );

  const { data: exams, isLoading: examsLoading } = useQuery(
    ['instructor-exams', user?.id],
    () => examService.getExamsByInstructor(user?.id),
    {
      enabled: !!user?.id,
      onSuccess: (data) => {
        setStats(prev => ({
          ...prev,
          myExams: data.length || 0
        }));
      }
    }
  );

  const isLoading = coursesLoading || assignmentsLoading || examsLoading;

  if (isLoading) {
    return <Loading text="Cargando información del instructor..." />;
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Panel del Instructor</h1>
          <p className={styles.subtitle}>
            Gestiona tus cursos y actividades académicas
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="primary" icon={<FaPlus />}>
            Nueva Actividad
          </Button>
          <Button variant="outline" icon={<FaCalendarAlt />}>
            Ver Calendario
          </Button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatsCard
          title="Mis Cursos"
          value={stats.myCourses}
          icon={<FaBook />}
          color="primary"
          trend={{ value: 2, type: 'increase' }}
        />
        <StatsCard
          title="Estudiantes"
          value={stats.totalStudents}
          icon={<FaUsers />}
          color="success"
          trend={{ value: 15, type: 'increase' }}
        />
        <StatsCard
          title="Tareas Creadas"
          value={stats.myAssignments}
          icon={<FaTasks />}
          color="warning"
          trend={{ value: 5, type: 'increase' }}
        />
        <StatsCard
          title="Exámenes"
          value={stats.myExams}
          icon={<FaClipboardCheck />}
          color="info"
          trend={{ value: 1, type: 'increase' }}
        />
      </div>

      <div className={styles.contentGrid}>
        <Card title="Mis Cursos" className={styles.coursesCard}>
          <div className={styles.coursesList}>
            {courses?.slice(0, 3).map(course => (
              <div key={course.id} className={styles.courseItem}>
                <div className={styles.courseInfo}>
                  <h4 className={styles.courseName}>{course.name}</h4>
                  <p className={styles.courseCode}>{course.code}</p>
                  <p className={styles.courseStudents}>
                    {course.enrollments?.length || 0} estudiantes
                  </p>
                </div>
                <Button size="small" variant="outline">
                  Ver Curso
                </Button>
              </div>
            ))}
            <Button variant="ghost" size="small" fullWidth>
              Ver todos los cursos
            </Button>
          </div>
        </Card>

        <Card title="Tareas Pendientes" className={styles.assignmentsCard}>
          <div className={styles.assignmentsList}>
            {assignments?.slice(0, 3).map(assignment => (
              <div key={assignment.id} className={styles.assignmentItem}>
                <div className={styles.assignmentInfo}>
                  <h4 className={styles.assignmentTitle}>{assignment.title}</h4>
                  <p className={styles.assignmentCourse}>{assignment.course?.name}</p>
                  <p className={styles.assignmentDue}>
                    Vence: {new Date(assignment.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div className={styles.assignmentActions}>
                  <Button size="small" variant="outline">
                    Revisar
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="ghost" size="small" fullWidth>
              Ver todas las tareas
            </Button>
          </div>
        </Card>
      </div>

      <div className={styles.quickActions}>
        <Card title="Acciones Rápidas">
          <div className={styles.actionsGrid}>
            <Button variant="outline" icon={<FaPlus />} fullWidth>
              Crear Tarea
            </Button>
            <Button variant="outline" icon={<FaClipboardCheck />} fullWidth>
              Crear Examen
            </Button>
            <Button variant="outline" icon={<FaCalendarAlt />} fullWidth>
              Programar Clase
            </Button>
            <Button variant="outline" icon={<FaUsers />} fullWidth>
              Ver Estudiantes
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InstructorDashboard;
