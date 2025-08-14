import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../../../context/AuthContext';
import StatsCard from '../StatsCard/StatsCard';
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import Loading from '../../common/Loading/Loading';
import { FaBook, FaTasks, FaClipboardCheck, FaClock, FaCalendarAlt, FaComments } from 'react-icons/fa';
import { courseService } from '../../../services/courseService';
import { assignmentService } from '../../../services/assignmentService';
import { examService } from '../../../services/examService';
import styles from './StudentDashboard.module.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    pendingAssignments: 0,
    upcomingExams: 0,
    completedTasks: 0
  });

  const { data: courses, isLoading: coursesLoading } = useQuery(
    ['student-courses', user?.id],
    () => courseService.getEnrolledCourses(user?.id),
    {
      enabled: !!user?.id,
      onSuccess: (data) => {
        setStats(prev => ({
          ...prev,
          enrolledCourses: data.length || 0
        }));
      }
    }
  );

  const { data: assignments, isLoading: assignmentsLoading } = useQuery(
    ['student-assignments', user?.id],
    () => assignmentService.getStudentAssignments(user?.id),
    {
      enabled: !!user?.id,
      onSuccess: (data) => {
        const pending = data.filter(assignment => 
          !assignment.submissions?.some(sub => sub.studentId === user?.id)
        );
        const completed = data.filter(assignment => 
          assignment.submissions?.some(sub => sub.studentId === user?.id)
        );
        
        setStats(prev => ({
          ...prev,
          pendingAssignments: pending.length || 0,
          completedTasks: completed.length || 0
        }));
      }
    }
  );

  const { data: exams, isLoading: examsLoading } = useQuery(
    ['student-exams', user?.id],
    () => examService.getStudentExams(user?.id),
    {
      enabled: !!user?.id,
      onSuccess: (data) => {
        const upcoming = data.filter(exam => 
          new Date(exam.startTime) > new Date()
        );
        
        setStats(prev => ({
          ...prev,
          upcomingExams: upcoming.length || 0
        }));
      }
    }
  );

  const isLoading = coursesLoading || assignmentsLoading || examsLoading;

  if (isLoading) {
    return <Loading text="Cargando información del estudiante..." />;
  }

  const pendingAssignments = assignments?.filter(assignment => 
    !assignment.submissions?.some(sub => sub.studentId === user?.id) &&
    new Date(assignment.dueDate) > new Date()
  ) || [];

  const upcomingExams = exams?.filter(exam => 
    new Date(exam.startTime) > new Date()
  ) || [];

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Mi Aula Virtual</h1>
          <p className={styles.subtitle}>
            Bienvenido a tu espacio de aprendizaje
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="primary" icon={<FaCalendarAlt />}>
            Ver Calendario
          </Button>
          <Button variant="outline" icon={<FaComments />}>
            Foros
          </Button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatsCard
          title="Cursos Inscritos"
          value={stats.enrolledCourses}
          icon={<FaBook />}
          color="primary"
        />
        <StatsCard
          title="Tareas Pendientes"
          value={stats.pendingAssignments}
          icon={<FaTasks />}
          color="warning"
        />
        <StatsCard
          title="Exámenes Próximos"
          value={stats.upcomingExams}
          icon={<FaClipboardCheck />}
          color="danger"
        />
        <StatsCard
          title="Tareas Completadas"
          value={stats.completedTasks}
          icon={<FaClock />}
          color="success"
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
                  <p className={styles.courseInstructor}>
                    Prof. {course.instructor?.firstName} {course.instructor?.lastName}
                  </p>
                </div>
                <div className={styles.courseProgress}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{ width: '75%' }}
                    ></div>
                  </div>
                  <span className={styles.progressText}>75%</span>
                </div>
                <Button size="small" variant="outline">
                  Ingresar
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
            {pendingAssignments?.slice(0, 3).map(assignment => (
              <div key={assignment.id} className={styles.assignmentItem}>
                <div className={styles.assignmentInfo}>
                  <h4 className={styles.assignmentTitle}>{assignment.title}</h4>
                  <p className={styles.assignmentCourse}>{assignment.course?.name}</p>
                  <div className={styles.assignmentMeta}>
                    <span className={styles.assignmentDue}>
                      Vence: {new Date(assignment.dueDate).toLocaleDateString()}
                    </span>
                    <span className={styles.assignmentPoints}>
                      {assignment.maxPoints} pts
                    </span>
                  </div>
                </div>
                <Button size="small" variant="primary">
                  Realizar
                </Button>
              </div>
            ))}
            {pendingAssignments?.length === 0 && (
              <div className={styles.emptyState}>
                <p>¡No tienes tareas pendientes!</p>
              </div>
            )}
            <Button variant="ghost" size="small" fullWidth>
              Ver todas las tareas
            </Button>
          </div>
        </Card>

        <Card title="Próximos Exámenes" className={styles.examsCard}>
          <div className={styles.examsList}>
            {upcomingExams?.slice(0, 3).map(exam => (
              <div key={exam.id} className={styles.examItem}>
                <div className={styles.examInfo}>
                  <h4 className={styles.examTitle}>{exam.title}</h4>
                  <p className={styles.examCourse}>{exam.course?.name}</p>
                  <div className={styles.examMeta}>
                    <span className={styles.examDate}>
                      {new Date(exam.startTime).toLocaleDateString()}
                    </span>
                    <span className={styles.examTime}>
                      {new Date(exam.startTime).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <div className={styles.examType}>
                  <span className={`${styles.examBadge} ${styles[exam.examType?.toLowerCase()]}`}>
                    {exam.examType}
                  </span>
                </div>
              </div>
            ))}
            {upcomingExams?.length === 0 && (
              <div className={styles.emptyState}>
                <p>No tienes exámenes próximos</p>
              </div>
            )}
            <Button variant="ghost" size="small" fullWidth>
              Ver todos los exámenes
            </Button>
          </div>
        </Card>
      </div>

      <div className={styles.recentActivity}>
        <Card title="Actividad Reciente">
          <div className={styles.activityList}>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>
                <FaTasks />
              </div>
              <div className={styles.activityContent}>
                <p className={styles.activityTitle}>Tarea entregada: "Análisis de Datos"</p>
                <p className={styles.activityTime}>Hace 2 horas</p>
              </div>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>
                <FaComments />
              </div>
              <div className={styles.activityContent}>
                <p className={styles.activityTitle}>Nuevo mensaje en el foro de Machine Learning</p>
                <p className={styles.activityTime}>Hace 4 horas</p>
              </div>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>
                <FaBook />
              </div>
              <div className={styles.activityContent}>
                <p className={styles.activityTitle}>Nuevo material disponible en Estadística</p>
                <p className={styles.activityTime}>Hace 1 día</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
