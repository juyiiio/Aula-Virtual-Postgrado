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
import announcementService from '../../../services/announcementService';
import styles from './StudentDashboard.module.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    pendingAssignments: 0,
    upcomingExams: 0,
    totalGrade: 0
  });
  const [courses, setCourses] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        
        const [studentCourses, recentAnnouncements] = await Promise.all([
          courseService.getStudentCourses(user.id),
          announcementService.getRecentAnnouncements(3)
        ]);

        setCourses(studentCourses);
        setAnnouncements(recentAnnouncements);

        const assignmentsPromises = studentCourses.map(course =>
          assignmentService.getStudentAssignments(user.id)
        );
        const examsPromises = studentCourses.map(course =>
          examService.getStudentExams(user.id)
        );

        const [assignmentsResults, examsResults] = await Promise.all([
          Promise.all(assignmentsPromises),
          Promise.all(examsPromises)
        ]);

        const allAssignments = assignmentsResults.flat();
        const allExams = examsResults.flat();

        const now = new Date();
        const pendingAssignments = allAssignments.filter(a => 
          new Date(a.dueDate) > now && !a.submitted
        );
        const upcomingExams = allExams.filter(e => 
          new Date(e.startTime) > now
        );

        const tasks = [
          ...pendingAssignments.map(a => ({
            type: 'assignment',
            title: a.title,
            dueDate: a.dueDate,
            courseId: a.courseId
          })),
          ...upcomingExams.map(e => ({
            type: 'exam',
            title: e.title,
            dueDate: e.startTime,
            courseId: e.courseId
          }))
        ].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 5);

        setPendingTasks(tasks);

        setStats({
          enrolledCourses: studentCourses.length,
          pendingAssignments: pendingAssignments.length,
          upcomingExams: upcomingExams.length,
          totalGrade: 0 // Calcular promedio cuando esté disponible
        });

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
        <h1 className={styles.title}>Mi Dashboard</h1>
        <p className={styles.subtitle}>Bienvenido, {user?.firstName} {user?.lastName}</p>
      </div>

      <div className={styles.statsGrid}>
        <StatsCard
          title="Cursos Inscritos"
          value={stats.enrolledCourses}
          icon="📚"
          color="primary"
        />
        <StatsCard
          title="Tareas Pendientes"
          value={stats.pendingAssignments}
          icon="📝"
          color="warning"
        />
        <StatsCard
          title="Exámenes Próximos"
          value={stats.upcomingExams}
          icon="📋"
          color="error"
        />
        <StatsCard
          title="Promedio"
          value={stats.totalGrade || '--'}
          icon="⭐"
          color="success"
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
                    <p className={styles.courseInstructor}>
                      Prof. {course.instructor?.firstName} {course.instructor?.lastName}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noData}>No estás inscrito en ningún curso</p>
            )}
          </Card>
        </div>

        <div className={styles.section}>
          <Card title="Tareas y Exámenes Próximos">
            {pendingTasks.length > 0 ? (
              <div className={styles.tasks}>
                {pendingTasks.map((task, index) => (
                  <div key={index} className={styles.task}>
                    <span className={styles.taskType}>
                      {task.type === 'assignment' ? '📝' : '📋'}
                    </span>
                    <div className={styles.taskInfo}>
                      <h5 className={styles.taskTitle}>{task.title}</h5>
                      <p className={styles.taskDate}>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noData}>No tienes tareas pendientes</p>
            )}
          </Card>
        </div>
      </div>

      <div className={styles.announcementsSection}>
        <Card title="Anuncios Recientes">
          {announcements.length > 0 ? (
            <div className={styles.announcements}>
              {announcements.map(announcement => (
                <div key={announcement.id} className={styles.announcement}>
                  <h4 className={styles.announcementTitle}>
                    {announcement.title}
                  </h4>
                  <p className={styles.announcementContent}>
                    {announcement.content}
                  </p>
                  <span className={styles.announcementDate}>
                    {new Date(announcement.publishedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noData}>No hay anuncios recientes</p>
          )}
        </Card>
      </div>

      <div className={styles.quickActions}>
        <Card title="Acciones Rápidas">
          <div className={styles.actions}>
            <Button variant="primary">
              Ver Calificaciones
            </Button>
            <Button variant="outline">
              Calendario
            </Button>
            <Button variant="secondary">
              Foros
            </Button>
            <Button variant="ghost">
              Recursos
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
