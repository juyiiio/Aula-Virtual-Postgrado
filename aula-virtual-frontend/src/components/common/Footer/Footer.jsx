import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.section}>
            <h4 className={styles.title}>Aula Virtual UNSLG</h4>
            <p className={styles.description}>
              Plataforma educativa de la Universidad Nacional San Luis Gonzaga de Ica
            </p>
          </div>
          
          <div className={styles.section}>
            <h4 className={styles.title}>Enlaces</h4>
            <ul className={styles.links}>
              <li><a href="#" className={styles.link}>Soporte Técnico</a></li>
              <li><a href="#" className={styles.link}>Manual de Usuario</a></li>
              <li><a href="#" className={styles.link}>Contacto</a></li>
            </ul>
          </div>
          
          <div className={styles.section}>
            <h4 className={styles.title}>Universidad</h4>
            <ul className={styles.links}>
              <li><a href="#" className={styles.link}>Página Principal</a></li>
              <li><a href="#" className={styles.link}>Postgrado</a></li>
              <li><a href="#" className={styles.link}>Biblioteca</a></li>
            </ul>
          </div>
        </div>
        
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {currentYear} Universidad Nacional San Luis Gonzaga de Ica. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
