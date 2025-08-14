import React, { useState, useEffect } from 'react';
import StatsCard from '../StatsCard/StatsCard';
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import Loading from '../../common/Loading/Loading';
import userService from '../../../services/userService';
import courseService from '../../../services/courseService';
import announcementService from '../../../services/announcementService';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalStudents: 0,
    totalInstructors: 0
  });
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const [users, courses, announcements] = await Promise.all([
          userService.getUsers(),
          courseService.getCourses(),
          announcementService.getRecentAnnouncements(5)
        ]);

        const students = users.filter(user => 
          user.roles?.some(role => role.name === 'STUDENT')
        );
        const instructors = users.filter(user => 
          user.roles?.some(role => role.name === 'INSTRUCTOR')
        );

        setStats({
          totalUsers: users.length,
          totalCourses: courses.length,
          totalStudents: students.length,
          totalInstructors: instructors.length
        });

        setRecentAnnouncements(announcements);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loading message="Cargando dashboard..." />;
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard Administrativo</h1>
        <p className={styles.subtitle}>Panel de control del sistema</p>
      </div>

      <div className={styles.statsGrid}>
        <StatsCard
          title="Total Usuarios"
          value={stats.totalUsers}
          icon="👥"
          color="primary"
        />
        <StatsCard
          title="Total Cursos"
          value={stats.totalCourses}
          icon="📚"
          color="success"
        />
        <StatsCard
          title="Estudiantes"
          value={stats.totalStudents}
          icon="🎓"
          color="info"
        />
        <StatsCard
          title="Instructores"
          value={stats.totalInstructors}
          icon="👨‍🏫"
          color="warning"
        />
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <Card title="Anuncios Recientes">
            {recentAnnouncements.length > 0 ? (
              <div className={styles.announcements}>
                {recentAnnouncements.map(announcement => (
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

        <div className={styles.section}>
          <Card title="Acciones Rápidas">
            <div className={styles.quickActions}>
              <Button variant="primary">
                Crear Usuario
              </Button>
              <Button variant="outline">
                Crear Curso
              </Button>
              <Button variant="secondary">
                Nuevo Anuncio
              </Button>
              <Button variant="ghost">
                Ver Reportes
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

