import React, { createContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      autoHide: true,
      duration: 5000,
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    if (newNotification.autoHide) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const updateNotification = useCallback((id, updates) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, ...updates }
          : notification
      )
    );
  }, []);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    updateNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export { NotificationContext, NotificationProvider };
