import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm/LoginForm';
import Card from '../../components/common/Card/Card';
import styles from './Login.module.css';

const Login = () => {
  return (
    <div className={styles.container}>
      <div className={styles.loginContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Bienvenido</h1>
          <p className={styles.subtitle}>Inicia sesión en tu aula virtual</p>
        </div>
        
        <Card className={styles.loginCard}>
          <LoginForm />
        </Card>
        
        <div className={styles.footer}>
          <p className={styles.footerText}>
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className={styles.link}>
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
      
      <div className={styles.background}>
        <div className={styles.shapes}>
          <div className={styles.shape1}></div>
          <div className={styles.shape2}></div>
          <div className={styles.shape3}></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
