import React from 'react';
import UserList from '../../components/users/UserList/UserList';
import styles from './Users.module.css';

const Users = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gestión de Usuarios</h1>
        <p className={styles.description}>
          Administra usuarios del sistema educativo
        </p>
      </div>
      
      <div className={styles.content}>
        <UserList />
      </div>
    </div>
  );
};

export default Users;
