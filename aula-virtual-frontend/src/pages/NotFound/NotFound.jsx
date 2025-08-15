import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button/Button';
import styles from './NotFound.module.css';

const NotFound = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.illustration}>
          <span className={styles.number}>404</span>
        </div>
        
        <div className={styles.text}>
          <h1 className={styles.title}>Página no encontrada</h1>
          <p className={styles.description}>
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>
        
        <div className={styles.actions}>
          <Link to="/dashboard">
            <Button variant="primary">
              🏠 Ir al Dashboard
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
          >
            ← Volver atrás
          </Button>
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

export default NotFound;
