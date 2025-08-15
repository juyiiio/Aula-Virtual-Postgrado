import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../../components/auth/RegisterForm/RegisterForm';
import Card from '../../components/common/Card/Card';
import styles from './Register.module.css';

const Register = () => {
  return (
    <div className={styles.container}>
      <div className={styles.registerContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Crear Cuenta</h1>
          <p className={styles.subtitle}>Únete a nuestra aula virtual</p>
        </div>
        
        <Card className={styles.registerCard}>
          <RegisterForm />
        </Card>
        
        <div className={styles.footer}>
          <p className={styles.footerText}>
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className={styles.link}>
              Inicia sesión aquí
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

export default Register;
