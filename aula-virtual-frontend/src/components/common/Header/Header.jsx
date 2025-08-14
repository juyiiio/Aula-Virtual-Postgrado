import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import styles from './Header.module.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/dashboard" className={styles.logoLink}>
            <span className={styles.logoText}>Aula Virtual UNSLG</span>
          </Link>
        </div>

        <nav className={styles.nav}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              {user?.firstName} {user?.lastName}
            </span>
            <div className={styles.dropdown}>
              <button className={styles.dropdownButton}>
                <img 
                  src={user?.profilePicture || '/default-avatar.png'} 
                  alt="Avatar" 
                  className={styles.avatar}
                />
              </button>
              <div className={styles.dropdownContent}>
                <Link to="/profile" className={styles.dropdownItem}>
                  Mi Perfil
                </Link>
                <button onClick={handleLogout} className={styles.dropdownItem}>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
