import React from 'react';
import UserProfile from '../../components/users/UserProfile/UserProfile';
import useAuth from '../../hooks/useAuth';
import styles from './Profile.module.css';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mi Perfil</h1>
        <p className={styles.description}>
          Gestiona tu información personal y configuraciones
        </p>
      </div>
      
      <div className={styles.content}>
        <UserProfile userId={user?.id} />
      </div>
    </div>
  );
};

export default Profile;
