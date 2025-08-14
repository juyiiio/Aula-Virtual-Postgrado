import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../common/Button/Button';
import Modal from '../../common/Modal/Modal';
import { 
  FaUser, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaCheck,
  FaTimes,
  FaCrown,
  FaUserGraduate,
  FaUserTie,
  FaUserShield,
  FaExclamationTriangle
} from 'react-icons/fa';
import { userService } from '../../../services/userService';
import { toast } from 'react-toastify';
import styles from './UserCard.module.css';

const UserCard = ({ user: userData, currentUser, onEdit, onUpdate }) => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canEdit = hasRole(['ADMIN']) || 
    (hasRole(['INSTRUCTOR']) && userData.roles?.includes('STUDENT'));
  
  const canDelete = hasRole(['ADMIN']) && userData.id !== currentUser?.id;

  // Delete user mutation
  const deleteUserMutation = useMutation(
    () => userService.deleteUser(userData.id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
        toast.success('Usuario eliminado exitosamente');
        onUpdate && onUpdate();
        setShowDeleteModal(false);
      },
      onError: (error) => {
        toast.error('Error al eliminar el usuario');
      }
    }
  );

  // Toggle user status mutation
  const toggleStatusMutation = useMutation(
    (newStatus) => userService.updateUserStatus(userData.id, newStatus),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
        toast.success('Estado del usuario actualizado');
        onUpdate && onUpdate();
      },
      onError: (error) => {
        toast.error('Error al actualizar el estado');
      }
    }
  );

  const getRoleIcon = () => {
    const primaryRole = userData.roles?.[0] || 'STUDENT';
    
    switch (primaryRole) {
      case 'ADMIN':
        return <FaUserShield className={styles.roleIconAdmin} />;
      case 'INSTRUCTOR':
        return <FaUserTie className={styles.roleIconInstructor} />;
      case 'STUDENT':
        return <FaUserGraduate className={styles.roleIconStudent} />;
      default:
        return <FaUser className={styles.roleIconDefault} />;
    }
  };

  const getRoleBadge = () => {
    const primaryRole = userData.roles?.[0] || 'STUDENT';
    
    const roleLabels = {
      'ADMIN': 'Administrador',
      'INSTRUCTOR': 'Instructor',
      'STUDENT': 'Estudiante'
    };

    const roleClasses = {
      'ADMIN': styles.roleAdmin,
      'INSTRUCTOR': styles.roleInstructor,
      'STUDENT': styles.roleStudent
    };

    return (
      <span className={`${styles.roleBadge} ${roleClasses[primaryRole]}`}>
        {roleLabels[primaryRole]}
      </span>
    );
  };

  const getStatusBadge = () => {
    const statusConfig = {
      'ACTIVE': { label: 'Activo', className: styles.statusActive },
      'INACTIVE': { label: 'Inactivo', className: styles.statusInactive },
      'PENDING': { label: 'Pendiente', className: styles.statusPending },
      'SUSPENDED': { label: 'Suspendido', className: styles.statusSuspended }
    };

    const config = statusConfig[userData.status] || statusConfig['PENDING'];
    
    return (
      <span className={`${styles.statusBadge} ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const handleViewProfile = () => {
    navigate(`/users/${userData.id}`);
  };

  const handleEdit = () => {
    onEdit && onEdit(userData);
  };

  const handleDelete = () => {
    setIsDeleting(true);
    deleteUserMutation.mutate();
  };

  const handleToggleStatus = () => {
    const newStatus = userData.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    toggleStatusMutation.mutate(newStatus);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = () => {
    const firstInitial = userData.firstName?.charAt(0) || '';
    const lastInitial = userData.lastName?.charAt(0) || '';
    return (firstInitial + lastInitial).toUpperCase();
  };

  return (
    <>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.userAvatar}>
            {userData.profilePicture ? (
              <img 
                src={userData.profilePicture} 
                alt={`${userData.firstName} ${userData.lastName}`}
              />
            ) : (
              <span className={styles.avatarInitials}>
                {getInitials()}
              </span>
            )}
            <div className={styles.roleIconOverlay}>
              {getRoleIcon()}
            </div>
          </div>
          
          <div className={styles.userInfo}>
            <h3 className={styles.userName}>
              {userData.firstName} {userData.lastName}
              {userData.id === currentUser?.id && (
                <FaCrown className={styles.currentUserIcon} title="Tu perfil" />
              )}
            </h3>
            
            <div className={styles.userMeta}>
              <span className={styles.userCode}>{userData.userCode}</span>
              <div className={styles.badges}>
                {getRoleBadge()}
                {getStatusBadge()}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.cardContent}>
          <div className={styles.contactInfo}>
            {userData.email && (
              <div className={styles.contactItem}>
                <FaEnvelope className={styles.contactIcon} />
                <span className={styles.contactText}>{userData.email}</span>
              </div>
            )}
            
            {userData.phone && (
              <div className={styles.contactItem}>
                <FaPhone className={styles.contactIcon} />
                <span className={styles.contactText}>{userData.phone}</span>
              </div>
            )}
            
            <div className={styles.contactItem}>
              <FaCalendarAlt className={styles.contactIcon} />
              <span className={styles.contactText}>
                Registrado: {formatDate(userData.createdAt)}
              </span>
            </div>
          </div>

          {userData.bio && (
            <div className={styles.userBio}>
              <p>{userData.bio}</p>
            </div>
          )}

          <div className={styles.userStats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>
                {userData.courseCount || 0}
              </span>
              <span className={styles.statLabel}>Cursos</span>
            </div>
            
            {userData.roles?.includes('STUDENT') && (
              <>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>
                    {userData.assignmentCount || 0}
                  </span>
                  <span className={styles.statLabel}>Tareas</span>
                </div>
                
                <div className={styles.statItem}>
                  <span className={styles.statValue}>
                    {userData.examCount || 0}
                  </span>
                  <span className={styles.statLabel}>Exámenes</span>
                </div>
              </>
            )}
            
            {userData.roles?.includes('INSTRUCTOR') && (
              <div className={styles.statItem}>
                <span className={styles.statValue}>
                  {userData.studentCount || 0}
                </span>
                <span className={styles.statLabel}>Estudiantes</span>
              </div>
            )}
          </div>

          {userData.lastLoginAt && (
            <div className={styles.lastLogin}>
              <span className={styles.lastLoginLabel}>Último acceso:</span>
              <span className={styles.lastLoginTime}>
                {formatDate(userData.lastLoginAt)}
              </span>
            </div>
          )}
        </div>

        <div className={styles.cardFooter}>
          <div className={styles.actions}>
            <Button
              variant="outline"
              size="small"
              icon={<FaEye />}
              onClick={handleViewProfile}
            >
              Ver Perfil
            </Button>

            {canEdit && (
              <Button
                variant="outline"
                size="small"
                icon={<FaEdit />}
                onClick={handleEdit}
              >
                Editar
              </Button>
            )}

            {hasRole(['ADMIN']) && userData.id !== currentUser?.id && (
              <Button
                variant={userData.status === 'ACTIVE' ? 'outline' : 'success'}
                size="small"
                icon={userData.status === 'ACTIVE' ? <FaTimes /> : <FaCheck />}
                onClick={handleToggleStatus}
                loading={toggleStatusMutation.isLoading}
              >
                {userData.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
              </Button>
            )}

            {canDelete && (
              <Button
                variant="danger"
                size="small"
                icon={<FaTrash />}
                onClick={() => setShowDeleteModal(true)}
              >
                Eliminar
              </Button>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Eliminación"
        size="small"
      >
        <div className={styles.deleteModal}>
          <div className={styles.deleteWarning}>
            <FaExclamationTriangle className={styles.warningIcon} />
            <h3>¿Eliminar usuario?</h3>
          </div>
          
          <p>
            ¿Estás seguro de que deseas eliminar a "{userData.firstName} {userData.lastName}"?
          </p>
          
          <div className={styles.deleteInfo}>
            <strong>Esta acción:</strong>
            <ul>
              <li>Eliminará permanentemente el usuario</li>
              <li>Removerá su acceso al sistema</li>
              <li>Mantendrá sus contribuciones (tareas, foros, etc.)</li>
            </ul>
          </div>
          
          <div className={styles.deleteActions}>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={isDeleting}
            >
              Eliminar Usuario
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default UserCard;
