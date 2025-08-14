import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import Footer from '../Footer/Footer';
import styles from './Layout.module.css';

const Layout = ({ children }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={styles.layout}>
      <Header toggleSidebar={toggleSidebar} />
      <div className={styles.mainContainer}>
        <Sidebar 
          isOpen={sidebarOpen} 
          userRole={user?.roles?.[0]?.name} 
        />
        <main className={`${styles.content} ${!sidebarOpen ? styles.contentExpanded : ''}`}>
          <div className={styles.contentInner}>
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default Layout;
