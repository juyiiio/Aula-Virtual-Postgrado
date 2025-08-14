import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import StatsCard from '../StatsCard/StatsCard';
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import Loading from '../../common/Loading/Loading';
import { FaUsers, FaBook, FaTasks, FaGraduationCap, FaPlus, FaChartLine } from 'react-icons/fa';
import { userService } from '../../../services/userService';
import { courseService } from '../../../services/courseService';
import { assignmentService } from '../../../services/assignmentService';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalAssignments: 0,
    totalStudents: 0
  });

  const { data: users, isLoading: usersLoading } = useQuery(
    'users-stats',
    () => userService.getAllUsers({ limit: 1 }),
    {
      onSuccess: (data) => {
        setStats(prev => ({
          ...prev,
          totalUsers: data.total || 0,
          totalStudents: data.data?.filter(user => 
            user.roles?.some(role => role.name === 'STUDENT')
          ).length || 0
        }));
      }
    }
  );

  const { data: courses, isLoading: coursesLoading } = useQuery(
    'courses-stats',
    () => courseService.getAllCourses({ limit: 1 }),
    {
      onSuccess: (data) => {
        setStats(prev => ({
          ...prev,
          totalCourses: data.total || 0
        }));
      }
    }
  );

  const { data: assignments, isLoading: assignmentsLoading } = useQuery(
    'assignments-stats',
    () => assignmentService.getAllAssignments({ limit: 1 }),
    {
      onSuccess: (data) => {
        setStats(prev => ({
          ...prev,
          totalAssignments: data.total || 0
        }));
      }
    }
  );

  const isLoading = usersLoading || coursesLoading || assignmentsLoading;

  if (isLoading) {
    return <Loading text="Cargando estadísticas..." />;
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Panel de Administración</h1>
          <p className={styles.subtitle}>
            Gestiona usuarios, cursos y contenido del aula virtual
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="primary" icon={<FaPlus />}>
            Nuevo Usuario
          </Button>
          <Button variant="outline" icon={<FaChartLine />}>
            Ver Reportes
          </Button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatsCard
          title="Total Usuarios"
          value={stats.totalUsers}
          icon={<FaUsers />}
          color="primary"
          trend={{ value: 12, type: 'increase' }}
        />
        <StatsCard
          title="Estudiantes"
          value={stats.totalStudents}
          icon={<FaGraduationCap />}
          color="success"
          trend={{ value: 8, type: 'increase' }}
        />
        <StatsCard
          title="Cursos Activos"
          value={stats.totalCourses}
          icon={<FaBook />}
          color="info"
          trend={{ value: 3, type: 'increase' }}
        />
        <StatsCard
          title="Tareas Creadas"
          value={stats.totalAssignments}
          icon={<FaTasks />}
          color="warning"
          trend={{ value: 15, type: 'increase' }}
        />
      </div>

      <div className={styles.contentGrid}>
        <Card title="Gestión de Usuarios" className={styles.managementCard}>
          <div className={styles.cardContent}>
            <p className={styles.cardDescription}>
              Administra usuarios, roles y permisos del sistema
            </p>
            <div className={styles.cardActions}>
              <Button variant="primary" size="small">
                Ver Usuarios
              </Button>
              <Button variant="outline" size="small">
                Crear Usuario
              </Button>
            </div>
          </div>
        </Card>

        <Card title="Gestión de Cursos" className={styles.managementCard}>
          <div className={styles.cardContent}>
            <p className={styles.cardDescription}>
              Crea y administra cursos, programas y contenido académico
            </p>
            <div className={styles.cardActions}>
              <Button variant="primary" size="small">
                Ver Cursos
              </Button>
              <Button variant="outline" size="small">
                Crear Curso
              </Button>
            </div>
          </div>
        </Card>

        <Card title="Reportes y Estadísticas" className={styles.managementCard}>
          <div className={styles.cardContent}>
            <p className={styles.cardDescription}>
              Genera reportes detallados y visualiza estadísticas del sistema
            </p>
            <div className={styles.cardActions}>
              <Button variant="primary" size="small">
                Ver Reportes
              </Button>
              <Button variant="outline" size="small">
                Exportar Datos
              </Button>
            </div>
          </div>
        </Card>

        <Card title="Configuración del Sistema" className={styles.managementCard}>
          <div className={styles.cardContent}>
            <p className={styles.cardDescription}>
              Configura parámetros generales y preferencias del sistema
            </p>
            <div className={styles.cardActions}>
              <Button variant="primary" size="small">
                Configurar
              </Button>
              <Button variant="outline" size="small">
                Ver Logs
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className={styles.recentActivity}>
        <Card title="Actividad Reciente">
          <div className={styles.activityList}>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>
                <FaUsers />
              </div>
              <div className={styles.activityContent}>
                <p className={styles.activityTitle}>Nuevo usuario registrado</p>
                <p className={styles.activityTime}>Hace 2 horas</p>
              </div>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>
                <FaBook />
              </div>
              <div className={styles.activityContent}>
                <p className={styles.activityTitle}>Curso "Machine Learning" actualizado</p>
                <p className={styles.activityTime}>Hace 4 horas</p>
              </div>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>
                <FaTasks />
              </div>
              <div className={styles.activityContent}>
                <p className={styles.activityTitle}>Nueva tarea asignada</p>
                <p className={styles.activityTime}>Hace 6 horas</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
