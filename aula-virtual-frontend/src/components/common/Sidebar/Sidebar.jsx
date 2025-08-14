import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const { user, hasRole } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: '📊',
      roles: ['ADMIN', 'INSTRUCTOR', 'STUDENT']
    },
    {
      path: '/courses',
      label: 'Cursos',
      icon: '📚',
      roles: ['ADMIN', 'INSTRUCTOR', 'STUDENT']
    },
    {
      path: '/assignments',
      label: 'Tareas',
      icon: '📝',
      roles: ['INSTRUCTOR', 'STUDENT']
    },
    {
      path: '/exams',
      label: 'Exámenes',
      icon: '📋',
      roles: ['INSTRUCTOR', 'STUDENT']
    },
    {
      path: '/forums',
      label: 'Foros',
      icon: '💬',
      roles: ['ADMIN', 'INSTRUCTOR', 'STUDENT']
    },
    {
      path: '/calendar',
      label: 'Calendario',
      icon: '📅',
      roles: ['ADMIN', 'INSTRUCTOR', 'STUDENT']
    },
    {
      path: '/videoconference',
      label: 'Videoconferencias',
      icon: '🎥',
      roles: ['INSTRUCTOR', 'STUDENT']
    },
    {
      path: '/users',
      label: 'Usuarios',
      icon: '👥',
      roles: ['ADMIN']
    },
    {
      path: '/announcements',
      label: 'Anuncios',
      icon: '📢',
      roles: ['ADMIN', 'INSTRUCTOR', 'STUDENT']
    },
    {
      path: '/resources',
      label: 'Recursos',
      icon: '📁',
      roles: ['ADMIN', 'INSTRUCTOR', 'STUDENT']
    }
  ];

  const visibleItems = menuItems.filter(item => 
    item.roles.some(role => hasRole(role))
  );

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        <ul className={styles.menuList}>
          {visibleItems.map(item => (
            <li key={item.path} className={styles.menuItem}>
              <Link 
                to={item.path} 
                className={`${styles.menuLink} ${isActive(item.path) ? styles.active : ''}`}
              >
                <span className={styles.icon}>{item.icon}</span>
                <span className={styles.label}>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
