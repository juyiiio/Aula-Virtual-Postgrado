import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { FaBars, FaUser, FaBell, FaSignOutAlt, FaCog } from 'react-icons/fa';
import styles from './Header.module.css';

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <button 
          className={styles.menuButton}
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <FaBars />
        </button>
        <Link to="/dashboard" className={styles.logo}>
          <h1>Aula Virtual UNSLG</h1>
        </Link>
      </div>

      <div className={styles.rightSection}>
        <button className={styles.notificationButton}>
          <FaBell />
          <span className={styles.notificationBadge}>3</span>
        </button>

        <div className={styles.userMenu}>
          <button 
            className={styles.userButton}
            onClick={toggleDropdown}
          >
            <div className={styles.userAvatar}>
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" />
              ) : (
                <FaUser />
              )}
            </div>
            <span className={styles.userName}>
              {user?.firstName} {user?.lastName}
            </span>
          </button>

          {dropdownOpen && (
            <div className={styles.dropdown}>
              <Link 
                to="/profile" 
                className={styles.dropdownItem}
                onClick={() => setDropdownOpen(false)}
              >
                <FaUser className={styles.dropdownIcon} />
                Mi Perfil
              </Link>
              <Link 
                to="/settings" 
                className={styles.dropdownItem}
                onClick={() => setDropdownOpen(false)}
              >
                <FaCog className={styles.dropdownIcon} />
                Configuración
              </Link>
              <hr className={styles.dropdownDivider} />
              <button 
                className={styles.dropdownItem}
                onClick={handleLogout}
              >
                <FaSignOutAlt className={styles.dropdownIcon} />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
