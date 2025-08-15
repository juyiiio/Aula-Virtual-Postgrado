import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import Loading from '../../common/Loading/Loading';
import Modal from '../../common/Modal/Modal';
import UserForm from '../UserForm/UserForm';
import useAuth from '../../../hooks/useAuth';
import userService from '../../../services/userService';
import useNotification from '../../../hooks/useNotification';
import { formatDate } from '../../../utils/dateUtils';
import { getInitials } from '../../../utils/helpers';
import styles from './UserProfile.module.css';

const UserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user: currentUser, hasRole } = useAuth();
  const { showError, showSuccess } = useNotification();

  const isOwnProfile = currentUser?.id === parseInt(id);
  const canEdit = hasRole('ADMIN') || isOwnProfile;

  useEffect(() => {
    fetchUserProfile();
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await userService.getUserById(id);
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      showError('Error al cargar el perfil del usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = (userData) => {
    setShowEditModal(false);
    fetchUserProfile();
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showError('La imagen debe ser menor a 5MB');
      return;
    }

    setUploading(true);
    try {
      await userService.updateProfilePicture(file);
      showSuccess('Foto de perfil actualizada exitosamente');
      fetchUserProfile();
    } catch (error) {
      const message = error?.response?.data?.message || 'Error al actualizar la foto';
      showError(message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <Loading message="Cargando perfil..." />;
  }

  if (!user) {
    return (
      <div className={styles.error}>
        <p>Usuario no encontrado</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Perfil de Usuario</h1>
        {canEdit && (
          <div className={styles.actions}>
            <Button
              variant="primary"
              onClick={() => setShowEditModal(true)}
            >
              Editar Perfil
            </Button>
          </div>
        )}
      </div>

      <div className={styles.content}>
        <Card className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <div className={styles.avatarSection}>
              <div className={styles.avatar}>
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="Avatar" className={styles.avatarImage} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {getInitials(user.firstName + ' ' + user.lastName)}
                  </div>
                )}
                {canEdit && (
                  <div className={styles.avatarOverlay}>
                    <input
                      type="file"
                      id="profilePicture"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className={styles.fileInput}
                    />
                    <label htmlFor="profilePicture" className={styles.avatarButton}>
                      {uploading ? '⏳' : '📷'}
                    </label>
                  </div>
                )}
              </div>
              
              <div className={styles.userStatus}>
                <span className={`${styles.statusBadge} ${styles[user.status?.toLowerCase()]}`}>
                  {user.status === 'ACTIVE' ? 'Activo' :
                   user.status === 'INACTIVE' ? 'Inactivo' :
                   user.status === 'SUSPENDED' ? 'Suspendido' : user.status}
                </span>
              </div>
            </div>

            <div className={styles.userInfo}>
              <h2 className={styles.userName}>
                {user.firstName} {user.lastName} {user.maternalSurname}
              </h2>
              <p className={styles.userCode}>{user.userCode}</p>
              <p className={styles.userEmail}>{user.email}</p>
              
              <div className={styles.roles}>
                {user.roles?.map(role => (
                  <span key={role.id} className={styles.roleBadge}>
                    {role.name === 'ADMIN' ? 'Administrador' :
                     role.name === 'INSTRUCTOR' ? 'Instructor' :
                     role.name === 'STUDENT' ? 'Estudiante' :
                     role.name === 'COORDINATOR' ? 'Coordinador' : role.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className={styles.detailsGrid}>
          <Card title="Información Personal">
            <div className={styles.detailsList}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Nombre completo:</span>
                <span>{user.firstName} {user.lastName} {user.maternalSurname}</span>
              </div>
              
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Email:</span>
                <span>{user.email}</span>
              </div>
              
              {user.phone && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Teléfono:</span>
                  <span>{user.phone}</span>
                </div>
              )}
              
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Nombre de usuario:</span>
                <span>{user.username}</span>
              </div>
            </div>
          </Card>

          <Card title="Información del Sistema">
            <div className={styles.detailsList}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Código de usuario:</span>
                <span>{user.userCode}</span>
              </div>
              
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Estado:</span>
                <span className={`${styles.statusText} ${styles[user.status?.toLowerCase()]}`}>
                  {user.status === 'ACTIVE' ? 'Activo' :
                   user.status === 'INACTIVE' ? 'Inactivo' :
                   user.status === 'SUSPENDED' ? 'Suspendido' : user.status}
                </span>
              </div>
              
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Fecha de registro:</span>
                <span>{formatDate(user.createdAt)}</span>
              </div>
              
              {user.lastLogin && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Último acceso:</span>
                  <span>{formatDate(user.lastLogin)}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Usuario"
        size="large"
      >
        <UserForm
          user={user}
          onSubmit={handleEditSubmit}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>
    </div>
  );
};

export default UserProfile;
