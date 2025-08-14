import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaBook, 
  FaTasks, 
  FaClipboardCheck, 
  FaComments, 
  FaCalendarAlt, 
  FaVideo, 
  FaUsers, 
  FaBullhorn,
  FaFolder,
  FaChartBar
} from 'react-icons/fa';
import styles from './Sidebar.module.css';

const Sidebar = ({ isOpen, userRole }) => {
  const getMenuItems = () => {
    const commonItems = [
      { path: '/dashboard', icon: FaTachometerAlt, label: 'Dashboard' },
      { path: '/courses', icon: FaBook, label: 'Mis Cursos' },
      { path: '/assignments', icon: FaTasks, label: 'Tareas' },
      { path: '/exams', icon: FaClipboardCheck, label: 'Exámenes' },
      { path: '/forums', icon: FaComments, label: 'Foros' },
      { path: '/calendar', icon: FaCalendarAlt, label: 'Calendario' },
      { path: '/conferences', icon: FaVideo, label: 'Videoconferencias' },
      { path: '/announcements', icon: FaBullhorn, label: 'Anuncios' },
      { path: '/resources', icon: FaFolder, label: 'Recursos' }
    ];

    const adminItems = [
      { path: '/users', icon: FaUsers, label: 'Gestión de Usuarios' },
      { path: '/reports', icon: FaChartBar, label: 'Reportes' }
    ];

    if (userRole === 'ADMIN' || userRole === 'COORDINATOR') {
      return [...commonItems, ...adminItems];
    }

    return commonItems;
  };

  const menuItems = getMenuItems();

  return (
    <aside className={`${styles.sidebar} ${!isOpen ? styles.sidebarClosed : ''}`}>
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path} className={styles.navItem}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                  }
                >
                  <Icon className={styles.navIcon} />
                  <span className={styles.navLabel}>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
