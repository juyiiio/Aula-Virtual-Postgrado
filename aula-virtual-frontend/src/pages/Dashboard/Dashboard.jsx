import React from 'react';
import useAuth from '../../hooks/useAuth';
import AdminDashboard from '../../components/dashboard/AdminDashboard/AdminDashboard';
import InstructorDashboard from '../../components/dashboard/InstructorDashboard/InstructorDashboard';
import StudentDashboard from '../../components/dashboard/StudentDashboard/StudentDashboard';
import Loading from '../../components/common/Loading/Loading';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const { user, hasRole, loading } = useAuth();

  if (loading) {
    return <Loading message="Cargando dashboard..." />;
  }

  const renderDashboard = () => {
    if (hasRole('ADMIN')) {
      return <AdminDashboard />;
    } else if (hasRole('INSTRUCTOR')) {
      return <InstructorDashboard />;
    } else if (hasRole('STUDENT')) {
      return <StudentDashboard />;
    } else {
      return (
        <div className={styles.noRole}>
          <h2>Acceso Restringido</h2>
          <p>No tienes permisos asignados para acceder al dashboard.</p>
        </div>
      );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.welcome}>
        <h1 className={styles.welcomeTitle}>
          ¡Bienvenido, {user?.firstName}!
        </h1>
        <p className={styles.welcomeSubtitle}>
          {new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      <div className={styles.dashboardContent}>
        {renderDashboard()}
      </div>
    </div>
  );
};

export default Dashboard;
