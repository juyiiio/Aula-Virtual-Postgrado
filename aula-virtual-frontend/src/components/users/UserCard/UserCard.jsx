import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import Modal from '../../common/Modal/Modal';
import useAuth from '../../../hooks/useAuth';
import userService from '../../../services/userService';
import useNotification from '../../../hooks/useNotification';
import { formatDate } from '../../../utils/dateUtils';
import { getInitials } from '../../../utils/helpers';
import styles from './UserCard.module.css';

const UserCard = ({ user, onUpdate }) => {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { hasRole } = useAuth();
  const { showError, showSuccess } = useNotification();

  const {
    id,
    userCode,
    firstName,
    lastName,
    email,
    phone,
    status,
    roles = [],
    profilePicture,
    createdAt,
    lastLogin
  } = user;

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    try {
      await userService.changeUserStatus(id, newStatus);
      showSuccess(`Estado del usuario actualizado a ${newStatus}`);
      setShowStatusModal(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      const message = error?.response?.data?.message || 'Error al cambiar el estado';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleNames = () => {
    return roles.map(role => role.name).join(', ');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'INACTIVE': return 'warning';
      case 'SUSPENDED': return 'error';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ACTIVE': return 'Activo';
      case 'INACTIVE': return 'Inactivo';
      case 'SUSPENDED': return 'Suspendido';
      default: return status;
    }
  };

  return (
    <>
      <Card className={styles.card} hoverable>
        <div className={styles.header}>
          <div className={styles.userAvatar}>
            {profilePicture ? (
              <img src={profilePicture} alt="Avatar" className={styles.avatarImage} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {getInitials(firstName + ' ' + lastName)}
              </div>
            )}
          </div>
          
          <div className={styles.userInfo}>
            <h3 className={styles.userName}>
              {firstName} {lastName}
            </h3>
            <p className={styles.userCode}>{userCode}</p>
            <p className={styles.userEmail}>{email}</p>
          </div>

          <span className={`${styles.status} ${styles[getStatusColor(status)]}`}>
            {getStatusText(status)}
          </span>
        </div>

        <div className={styles.content}>
          <div className={styles.metadata}>
            <div className={styles.metadataItem}>
              <span className={styles.label}>Roles:</span>
              <span className={styles.roles}>{getRoleNames() || 'Sin roles'}</span>
            </div>

            {phone && (
              <div className={styles.metadataItem}>
                <span className={styles.label}>Teléfono:</span>
                <span>{phone}</span>
              </div>
            )}

            <div className={styles.metadataItem}>
              <span className={styles.label}>Registro:</span>
              <span>{formatDate(createdAt)}</span>
            </div>

            {lastLogin && (
              <div className={styles.metadataItem}>
                <span className={styles.label}>Último acceso:</span>
                <span>{formatDate(lastLogin)}</span>
              </div>
            )}
          </div>
        </div>

        {hasRole('ADMIN') && (
          <div className={styles.footer}>
            <Link to={`/users/${id}`}>
              <Button variant="outline" size="small">
                Ver Perfil
              </Button>
            </Link>
            
            <Button
              variant="ghost"
              size="small"
              onClick={() => setShowStatusModal(true)}
            >
              Cambiar Estado
            </Button>
          </div>
        )}
      </Card>

      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Cambiar Estado del Usuario"
      >
        <div className={styles.statusModal}>
          <p>
            Selecciona el nuevo estado para <strong>{firstName} {lastName}</strong>:
          </p>
          
          <div className={styles.statusOptions}>
            <Button
              variant={status === 'ACTIVE' ? 'primary' : 'outline'}
              onClick={() => handleStatusChange('ACTIVE')}
              loading={loading}
              disabled={status === 'ACTIVE'}
              className={styles.statusButton}
            >
              ✅ Activo
            </Button>
            
            <Button
              variant={status === 'INACTIVE' ? 'primary' : 'outline'}
              onClick={() => handleStatusChange('INACTIVE')}
              loading={loading}
              disabled={status === 'INACTIVE'}
              className={styles.statusButton}
            >
              ⏸️ Inactivo
            </Button>
            
            <Button
              variant={status === 'SUSPENDED' ? 'primary' : 'outline'}
              onClick={() => handleStatusChange('SUSPENDED')}
              loading={loading}
              disabled={status === 'SUSPENDED'}
              className={styles.statusButton}
            >
              🚫 Suspendido
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UserCard;
