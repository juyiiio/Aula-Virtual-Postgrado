import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../../../context/AuthContext';
import UserCard from '../UserCard/UserCard';
import Loading from '../../common/Loading/Loading';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import Modal from '../../common/Modal/Modal';
import UserForm from '../UserForm/UserForm';
import { 
  FaSearch, 
  FaFilter, 
  FaPlus, 
  FaUsers, 
  FaUserGraduate,
  FaUserTie,
  FaUserShield,
  FaDownload,
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaCalendarAlt
} from 'react-icons/fa';
import { userService } from '../../../services/userService';
import styles from './UserList.module.css';

const UserList = () => {
  const { user, hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const itemsPerPage = 24;

  const { data: usersData, isLoading, refetch } = useQuery(
    ['users', currentPage, searchTerm, roleFilter, statusFilter, sortBy, sortOrder],
    () => userService.getAllUsers({
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm,
      role: roleFilter !== 'all' ? roleFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      sortBy,
      sortOrder
    }),
    {
      enabled: hasRole(['ADMIN', 'INSTRUCTOR']),
      keepPreviousData: true
    }
  );

  const { data: userStats } = useQuery(
    'user-statistics',
    () => userService.getUserStatistics(),
    {
      enabled: hasRole(['ADMIN'])
    }
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleRoleFilter = (e) => {
    setRoleFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowUserForm(true);
  };

  const handleEditUser = (userData) => {
    setEditingUser(userData);
    setShowUserForm(true);
  };

  const handleFormSuccess = () => {
    setShowUserForm(false);
    setEditingUser(null);
    refetch();
  };

  const handleExportUsers = async () => {
    try {
      await userService.exportUsers({
        search: searchTerm,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
    } catch (error) {
      console.error('Error exporting users:', error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getRoleIcon = (role) => {
    const roleIcons = {
      'STUDENT': <FaUserGraduate className={styles.roleIconStudent} />,
      'INSTRUCTOR': <FaUserTie className={styles.roleIconInstructor} />,
      'ADMIN': <FaUserShield className={styles.roleIconAdmin} />
    };
    return roleIcons[role] || <FaUsers />;
  };

  const getRoleStats = () => {
    if (!userStats) return [];
    
    return [
      {
        role: 'STUDENT',
        label: 'Estudiantes',
        count: userStats.studentCount || 0,
        icon: <FaUserGraduate />
      },
      {
        role: 'INSTRUCTOR',
        label: 'Instructores',
        count: userStats.instructorCount || 0,
        icon: <FaUserTie />
      },
      {
        role: 'ADMIN',
        label: 'Administradores',
        count: userStats.adminCount || 0,
        icon: <FaUserShield />
      }
    ];
  };

  if (!hasRole(['ADMIN', 'INSTRUCTOR'])) {
    return (
      <div className={styles.noPermission}>
        <h2>Sin permisos</h2>
        <p>No tienes permisos para ver la lista de usuarios.</p>
      </div>
    );
  }

  if (isLoading) {
    return <Loading text="Cargando usuarios..." />;
  }

  const users = usersData?.data || [];
  const totalPages = Math.ceil((usersData?.total || 0) / itemsPerPage);
  const roleStats = getRoleStats();

  const statusFilters = [
    { id: 'all', label: 'Todos', count: usersData?.total || 0 },
    { id: 'active', label: 'Activos', count: usersData?.activeCount || 0 },
    { id: 'inactive', label: 'Inactivos', count: usersData?.inactiveCount || 0 },
    { id: 'pending', label: 'Pendientes', count: usersData?.pendingCount || 0 }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <FaUsers className={styles.titleIcon} />
            Gestión de Usuarios
          </h1>
          <p className={styles.subtitle}>
            Administra usuarios, roles y permisos del sistema
          </p>
        </div>
        {hasRole(['ADMIN']) && (
          <div className={styles.headerActions}>
            <Button
              variant="outline"
              icon={<FaDownload />}
              onClick={handleExportUsers}
            >
              Exportar
            </Button>
            <Button
              variant="primary"
              icon={<FaPlus />}
              onClick={handleCreateUser}
            >
              Nuevo Usuario
            </Button>
          </div>
        )}
      </div>

      {hasRole(['ADMIN']) && userStats && (
        <div className={styles.statsSection}>
          <div className={styles.statsGrid}>
            {roleStats.map(stat => (
              <div key={stat.role} className={styles.statCard}>
                <div className={styles.statIcon}>
                  {stat.icon}
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statValue}>{stat.count}</div>
                  <div className={styles.statLabel}>{stat.label}</div>
                </div>
              </div>
            ))}
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <FaCalendarAlt />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{userStats.newUsersThisMonth || 0}</div>
                <div className={styles.statLabel}>Nuevos este mes</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.filtersSection}>
        <div className={styles.searchAndFilters}>
          <div className={styles.searchFilter}>
            <Input
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={handleSearch}
              icon={<FaSearch />}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.dropdownFilters}>
            <select
              value={roleFilter}
              onChange={handleRoleFilter}
              className={styles.roleSelect}
            >
              <option value="all">Todos los roles</option>
              <option value="STUDENT">Estudiantes</option>
              <option value="INSTRUCTOR">Instructores</option>
              <option value="ADMIN">Administradores</option>
            </select>
            
            <div className={styles.sortControls}>
              <Button
                variant="ghost"
                size="small"
                icon={sortOrder === 'asc' ? <FaSortAlphaDown /> : <FaSortAlphaUp />}
                onClick={() => handleSortChange('name')}
                className={sortBy === 'name' ? styles.activeSortButton : ''}
              >
                Nombre
              </Button>
              <Button
                variant="ghost"
                size="small"
                icon={<FaCalendarAlt />}
                onClick={() => handleSortChange('createdAt')}
                className={sortBy === 'createdAt' ? styles.activeSortButton : ''}
              >
                Fecha
              </Button>
            </div>
          </div>
        </div>
        
        <div className={styles.statusFilters}>
          {statusFilters.map(filter => (
            <button
              key={filter.id}
              className={`${styles.statusButton} ${statusFilter === filter.id ? styles.active : ''}`}
              onClick={() => handleStatusFilter(filter.id)}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>
      </div>

      <div className={styles.usersSection}>
        {users.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyContent}>
              <FaUsers className={styles.emptyIcon} />
              <h3>No se encontraron usuarios</h3>
              <p>
                {searchTerm 
                  ? 'No hay usuarios que coincidan con los criterios de búsqueda.'
                  : 'Aún no hay usuarios registrados en el sistema.'
                }
              </p>
              {hasRole(['ADMIN']) && !searchTerm && (
                <Button 
                  variant="primary" 
                  icon={<FaPlus />}
                  onClick={handleCreateUser}
                >
                  Crear Primer Usuario
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className={styles.usersGrid}>
              {users.map(userData => (
                <UserCard
                  key={userData.id}
                  user={userData}
                  currentUser={user}
                  onEdit={handleEditUser}
                  onUpdate={refetch}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Anterior
                </Button>
                
                <div className={styles.pageNumbers}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`${styles.pageButton} ${currentPage === page ? styles.activePage : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Form Modal */}
      <Modal
        isOpen={showUserForm}
        onClose={() => setShowUserForm(false)}
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        size="large"
      >
        <UserForm
          user={editingUser}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowUserForm(false)}
        />
      </Modal>
    </div>
  );
};

export default UserList;
