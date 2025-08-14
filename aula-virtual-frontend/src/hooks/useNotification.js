import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

const useNotification = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }

  const { notifications, addNotification, removeNotification, clearNotifications } = context;

  const showNotification = (message, type = 'info', options = {}) => {
    const notification = {
      id: Date.now() + Math.random(),
      message,
      type,
      autoHide: options.autoHide !== false,
      duration: options.duration || 5000,
      ...options
    };

    addNotification(notification);
    return notification.id;
  };

  const showSuccess = (message, options = {}) => {
    return showNotification(message, 'success', options);
  };

  const showError = (message, options = {}) => {
    return showNotification(message, 'error', { autoHide: false, ...options });
  };

  const showWarning = (message, options = {}) => {
    return showNotification(message, 'warning', options);
  };

  const showInfo = (message, options = {}) => {
    return showNotification(message, 'info', options);
  };

  const hideNotification = (id) => {
    removeNotification(id);
  };

  const hideAllNotifications = () => {
    clearNotifications();
  };

  return {
    notifications,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideNotification,
    hideAllNotifications
  };
};

export { useNotification };
export default useNotification;
