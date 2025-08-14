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
              Plataforma educativa para programas de postgrado de la 
              Universidad Nacional San Luis Gonzaga de Ica.
            </p>
          </div>
          
          <div className={styles.section}>
            <h4 className={styles.title}>Enlaces</h4>
            <ul className={styles.links}>
              <li><a href="/dashboard">Dashboard</a></li>
              <li><a href="/courses">Cursos</a></li>
              <li><a href="/calendar">Calendario</a></li>
              <li><a href="/resources">Recursos</a></li>
            </ul>
          </div>
          
          <div className={styles.section}>
            <h4 className={styles.title}>Soporte</h4>
            <ul className={styles.links}>
              <li><a href="/help">Centro de Ayuda</a></li>
              <li><a href="/contact">Contacto</a></li>
              <li><a href="/faq">Preguntas Frecuentes</a></li>
            </ul>
          </div>
          
          <div className={styles.section}>
            <h4 className={styles.title}>Contacto</h4>
            <div className={styles.contact}>
              <p>Email: soporte@unslg.edu.pe</p>
              <p>Teléfono: (056) 123-456</p>
              <p>Dirección: Av. Los Maestros s/n, Ica</p>
            </div>
          </div>
        </div>
        
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {currentYear} Universidad Nacional San Luis Gonzaga de Ica. 
            Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
