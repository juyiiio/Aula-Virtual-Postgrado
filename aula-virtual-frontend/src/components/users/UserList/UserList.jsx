import React, { useState, useEffect } from 'react';
import UserCard from '../UserCard/UserCard';
import Loading from '../../common/Loading/Loading';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import useAuth from '../../../hooks/useAuth';
import userService from '../../../services/userService';
import { searchInArray } from '../../../utils/helpers';
import styles from './UserList.module.css';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { hasRole } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await userService.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filtrar por rol
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => 
        user.roles?.some(role => role.name === roleFilter)
      );
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = searchInArray(filtered, searchTerm, [
        'firstName', 'lastName', 'email', 'userCode'
      ]);
    }

    setFilteredUsers(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleUserUpdate = () => {
    fetchUsers();
  };

  if (loading) {
    return <Loading message="Cargando usuarios..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Gestión de Usuarios</h2>
        <div className={styles.actions}>
          {hasRole('ADMIN') && (
            <Button variant="primary">
              Nuevo Usuario
            </Button>
          )}
        </div>
      </div>

      <div className={styles.filters}>
        <Input
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />

        <select
          value={roleFilter}
          onChange={handleRoleFilterChange}
          className={styles.filterSelect}
        >
          <option value="all">Todos los roles</option>
          <option value="ADMIN">Administradores</option>
          <option value="INSTRUCTOR">Instructores</option>
          <option value="STUDENT">Estudiantes</option>
          <option value="COORDINATOR">Coordinadores</option>
        </select>

        <select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          className={styles.filterSelect}
        >
          <option value="all">Todos los estados</option>
          <option value="ACTIVE">Activos</option>
          <option value="INACTIVE">Inactivos</option>
          <option value="SUSPENDED">Suspendidos</option>
        </select>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{filteredUsers.length}</span>
          <span className={styles.statLabel}>Usuarios encontrados</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {users.filter(u => u.status === 'ACTIVE').length}
          </span>
          <span className={styles.statLabel}>Activos</span>
        </div>
      </div>

      {filteredUsers.length > 0 ? (
        <div className={styles.usersGrid}>
          {filteredUsers.map(user => (
            <UserCard
              key={user.id}
              user={user}
              onUpdate={handleUserUpdate}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>
            {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
              ? 'No se encontraron usuarios con los filtros aplicados'
              : 'No hay usuarios disponibles'}
          </p>
        </div>
      )}
    </div>
  );
};

export default UserList;
