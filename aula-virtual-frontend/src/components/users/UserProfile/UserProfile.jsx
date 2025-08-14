import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../common/Button/Button';
import Card from '../../common/Card/Card';
import Loading from '../../common/Loading/Loading';
import Modal from '../../common/Modal/Modal';
import UserForm from '../UserForm/UserForm';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaEnvelope, 
  FaPhone, 
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaBook,
  FaClipboardList,
  FaTrophy,
  FaUsers,
  FaCertificate,
  FaChartLine,
  FaDownload,
  FaShare,
  FaCog,
  FaUser
} from 'react-icons/fa';
import { userService } from '../../../services/userService';
import { toast } from 'react-toastify';
import styles from './UserProfile.module.css';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, hasRole } = useAuth();
  const queryClient = useQueryClient();
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const isOwnProfile = id === currentUser?.id;
  const canEdit = isOwnProfile || hasRole(['ADMIN']) || 
    (hasRole(['INSTRUCTOR']) && currentUser?.id !== id);

  // Fetch user profile data
  const { data: user, isLoading, error } = useQuery(
    ['user-profile', id],
    () => userService.getUserProfile(id),
    {
      onError: (error) => {
        toast.error('Error al cargar el perfil');
        navigate('/users');
      }
    }
  );

  // Fetch user activity
  const { data: userActivity } = useQuery(
    ['user-activity', id],
    () => userService.getUserActivity(id),
    {
      enabled: !!user
    }
  );

  // Fetch user achievements
  const { data: userAchievements } = useQuery(
    ['user-achievements', id],
    () => userService.getUserAchievements(id),
    {
      enabled: !!user && (isOwnProfile || hasRole(['ADMIN', 'INSTRUCTOR']))
    }
  );

  // Update profile mutation
  const updateProfileMutation = useMutation(
    (profileData) => userService.updateProfile(id, profileData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['user-profile', id]);
        toast.success('Perfil actualizado exitosamente');
        setShowEditModal(false);
      },
      onError: (error) => {
        toast.error('Error al actualizar el perfil');
      }
    }
  );

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleFormSuccess = () => {
    setShowEditModal(false);
    queryClient.invalidateQueries(['user-profile', id]);
  };

  const handleExportProfile = async () => {
    try {
      await userService.exportUserProfile(id);
      toast.success('Perfil exportado exitosamente');
    } catch (error) {
      toast.error('Error al exportar el perfil');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = () => {
    if (!user) return '';
    const firstInitial = user.firstName?.charAt(0) || '';
    const lastInitial = user.lastName?.charAt(0) || '';
    return (firstInitial + lastInitial).toUpperCase();
  };

  const getRoleBadge = () => {
    const primaryRole = user?.roles?.[0] || 'STUDENT';
    
    const roleConfig = {
      'ADMIN': { label: 'Administrador', className: styles.roleAdmin },
      'INSTRUCTOR': { label: 'Instructor', className: styles.roleInstructor },
      'STUDENT': { label: 'Estudiante', className: styles.roleStudent }
    };

    const config = roleConfig[primaryRole];
    
    return (
      <span className={`${styles.roleBadge} ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const renderOverviewTab = () => (
    <div className={styles.overviewContent}>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaBook />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{user?.stats?.coursesCount || 0}</div>
            <div className={styles.statLabel}>Cursos</div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaClipboardList />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{user?.stats?.assignmentsCount || 0}</div>
            <div className={styles.statLabel}>Tareas</div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaGraduationCap />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{user?.stats?.examsCount || 0}</div>
            <div className={styles.statLabel}>Exámenes</div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaTrophy />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{user?.stats?.achievementsCount || 0}</div>
            <div className={styles.statLabel}>Logros</div>
          </div>
        </div>
      </div>

      {user?.bio && (
        <Card title="Biografía">
          <p className={styles.bioText}>{user.bio}</p>
        </Card>
      )}

      <Card title="Información Personal">
        <div className={styles.personalInfo}>
          <div className={styles.infoItem}>
            <FaEnvelope className={styles.infoIcon} />
            <span className={styles.infoLabel}>Email:</span>
            <span className={styles.infoValue}>{user?.email}</span>
          </div>
          
          {user?.phone && (
            <div className={styles.infoItem}>
              <FaPhone className={styles.infoIcon} />
              <span className={styles.infoLabel}>Teléfono:</span>
              <span className={styles.infoValue}>{user.phone}</span>
            </div>
          )}
          
          {user?.address && (
            <div className={styles.infoItem}>
              <FaMapMarkerAlt className={styles.infoIcon} />
              <span className={styles.infoLabel}>Dirección:</span>
              <span className={styles.infoValue}>{user.address}</span>
            </div>
          )}
          
          <div className={styles.infoItem}>
            <FaCalendarAlt className={styles.infoIcon} />
            <span className={styles.infoLabel}>Miembro desde:</span>
            <span className={styles.infoValue}>{formatDate(user?.createdAt)}</span>
          </div>
          
          {user?.lastLoginAt && (
            <div className={styles.infoItem}>
              <FaUser className={styles.infoIcon} />
              <span className={styles.infoLabel}>Último acceso:</span>
              <span className={styles.infoValue}>{formatDate(user.lastLoginAt)}</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  const renderActivityTab = () => (
    <Card title="Actividad Reciente">
      {userActivity?.length === 0 ? (
        <div className={styles.emptyActivity}>
          <p>No hay actividad reciente</p>
        </div>
      ) : (
        <div className={styles.activityList}>
          {userActivity?.map((activity, index) => (
            <div key={index} className={styles.activityItem}>
              <div className={styles.activityIcon}>
                {activity.type === 'course' && <FaBook />}
                {activity.type === 'assignment' && <FaClipboardList />}
                {activity.type === 'exam' && <FaGraduationCap />}
                {activity.type === 'forum' && <FaUsers />}
              </div>
              <div className={styles.activityContent}>
                <div className={styles.activityTitle}>{activity.title}</div>
                <div className={styles.activityDescription}>{activity.description}</div>
                <div className={styles.activityDate}>
                  {formatDate(activity.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  const renderAchievementsTab = () => (
    <Card title="Logros y Certificados">
      {userAchievements?.length === 0 ? (
        <div className={styles.emptyAchievements}>
          <FaTrophy className={styles.emptyIcon} />
          <p>Aún no hay logros desbloqueados</p>
        </div>
      ) : (
        <div className={styles.achievementsGrid}>
          {userAchievements?.map((achievement) => (
            <div key={achievement.id} className={styles.achievementCard}>
              <div className={styles.achievementIcon}>
                <FaCertificate />
              </div>
              <div className={styles.achievementContent}>
                <h4 className={styles.achievementTitle}>{achievement.title}</h4>
                <p className={styles.achievementDescription}>{achievement.description}</p>
                <div className={styles.achievementDate}>
                  Obtenido: {formatDate(achievement.earnedAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  if (isLoading) {
    return <Loading text="Cargando perfil..." />;
  }

  if (error || !user) {
    return (
      <div className={styles.notFound}>
        <h2>Usuario no encontrado</h2>
        <p>El perfil que buscas no existe o no tienes permisos para verlo.</p>
        <Button variant="primary" onClick={() => navigate('/users')}>
          Volver a Usuarios
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Información General', icon: <FaUser /> },
    { id: 'activity', label: 'Actividad', icon: <FaChartLine /> },
    { id: 'achievements', label: 'Logros', icon: <FaTrophy /> }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          variant="ghost"
          icon={<FaArrowLeft />}
          onClick={() => navigate('/users')}
        >
          Volver
        </Button>
        
        <div className={styles.headerActions}>
          {isOwnProfile && (
            <Button
              variant="outline"
              icon={<FaDownload />}
              onClick={handleExportProfile}
            >
              Exportar Perfil
            </Button>
          )}
          
          {canEdit && (
            <Button
              variant="primary"
              icon={<FaEdit />}
              onClick={handleEditProfile}
            >
              Editar Perfil
            </Button>
          )}
        </div>
      </div>

      <div className={styles.profileHeader}>
        <div className={styles.profileAvatar}>
          {user.profilePicture ? (
            <img src={user.profilePicture} alt={`${user.firstName} ${user.lastName}`} />
          ) : (
            <span className={styles.avatarInitials}>{getInitials()}</span>
          )}
        </div>
        
        <div className={styles.profileInfo}>
          <h1 className={styles.profileName}>
            {user.firstName} {user.lastName}
          </h1>
          <div className={styles.profileMeta}>
            <span className={styles.userCode}>{user.userCode}</span>
            {getRoleBadge()}
          </div>
          {user.title && (
            <p className={styles.profileTitle}>{user.title}</p>
          )}
        </div>
      </div>

      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'activity' && renderActivityTab()}
        {activeTab === 'achievements' && renderAchievementsTab()}
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Perfil"
        size="large"
      >
        <UserForm
          user={user}
          isProfile={true}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>
    </div>
  );
};

export default UserProfile;
