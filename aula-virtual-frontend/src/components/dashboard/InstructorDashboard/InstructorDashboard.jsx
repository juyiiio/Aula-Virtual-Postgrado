import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatsCard from '../StatsCard/StatsCard';
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import Loading from '../../common/Loading/Loading';
import useAuth from '../../../hooks/useAuth';
import courseService from '../../../services/courseService';
import assignmentService from '../../../services/assignmentService';
import examService from '../../../services/examService';
import styles from './InstructorDashboard.module.css';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalAssignments: 0,
    totalExams: 0,
    pendingGrading: 0
  });
  const [courses, setCourses] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        
        const instructorCourses = await courseService.getInstructorCourses(user.id);
        setCourses(instructorCourses);

        const assignmentsPromises = instructorCourses.map(course =>
          assignmentService.getAssignmentsByCourse(course.id)
        );
        const examsPromises = instructorCourses.map(course =>
          examService.getExamsByCourse(course.id)
        );

        const [assignmentsResults, examsResults] = await Promise.all([
          Promise.all(assignmentsPromises),
          Promise.all(examsPromises)
        ]);

        const allAssignments = assignmentsResults.flat();
        const allExams = examsResults.flat();

        setStats({
          totalCourses: instructorCourses.length,
          totalAssignments: allAssignments.length,
          totalExams: allExams.length,
          pendingGrading: allAssignments.filter(a => a.pendingSubmissions > 0).length
        });

        const deadlines = [
          ...allAssignments.map(a => ({
            type: 'assignment',
            title: a.title,
            dueDate: a.dueDate,
            courseId: a.courseId
          })),
          ...allExams.map(e => ({
            type: 'exam',
            title: e.title,
            dueDate: e.startTime,
            courseId: e.courseId
          }))
        ].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 5);

        setUpcomingDeadlines(deadlines);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return <Loading message="Cargando dashboard..." />;
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard del Instructor</h1>
        <p className={styles.subtitle}>Bienvenido, {user?.firstName} {user?.lastName}</p>
      </div>

      <div className={styles.statsGrid}>
        <StatsCard
          title="Mis Cursos"
          value={stats.totalCourses}
          icon="📚"
          color="primary"
        />
        <StatsCard
          title="Tareas"
          value={stats.totalAssignments}
          icon="📝"
          color="success"
        />
        <StatsCard
          title="Exámenes"
          value={stats.totalExams}
          icon="📋"
          color="info"
        />
        <StatsCard
          title="Por Calificar"
          value={stats.pendingGrading}
          icon="⏳"
          color="warning"
        />
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <Card title="Mis Cursos">
            {courses.length > 0 ? (
              <div className={styles.courses}>
                {courses.map(course => (
                  <div key={course.id} className={styles.course}>
                    <h4 className={styles.courseTitle}>
                      <Link to={`/courses/${course.id}`} className={styles.courseLink}>
                        {course.name}
                      </Link>
                    </h4>
                    <p className={styles.courseCode}>{course.code}</p>
                    <p className={styles.courseStudents}>
                      {course.enrolledStudents || 0} estudiantes
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noData}>No tienes cursos asignados</p>
            )}
          </Card>
        </div>

        <div className={styles.section}>
          <Card title="Próximas Fechas">
            {upcomingDeadlines.length > 0 ? (
              <div className={styles.deadlines}>
                {upcomingDeadlines.map((deadline, index) => (
                  <div key={index} className={styles.deadline}>
                    <span className={styles.deadlineType}>
                      {deadline.type === 'assignment' ? '📝' : '📋'}
                    </span>
                    <div className={styles.deadlineInfo}>
                      <h5 className={styles.deadlineTitle}>{deadline.title}</h5>
                      <p className={styles.deadlineDate}>
                        {new Date(deadline.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noData}>No hay fechas próximas</p>
            )}
          </Card>
        </div>
      </div>

      <div className={styles.quickActions}>
        <Card title="Acciones Rápidas">
          <div className={styles.actions}>
            <Button variant="primary">
              Nueva Tarea
            </Button>
            <Button variant="outline">
              Nuevo Examen
            </Button>
            <Button variant="secondary">
              Ver Calificaciones
            </Button>
            <Button variant="ghost">
              Subir Recursos
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InstructorDashboard;
