import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../../../context/AuthContext';
import AssignmentCard from '../AssignmentCard/AssignmentCard';
import Loading from '../../common/Loading/Loading';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import { FaSearch, FaFilter, FaPlus, FaCalendarAlt } from 'react-icons/fa';
import { assignmentService } from '../../../services/assignmentService';
import styles from './AssignmentList.module.css';

const AssignmentList = () => {
  const { user, hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { data: assignmentsData, isLoading, refetch } = useQuery(
    ['assignments', currentPage, searchTerm, statusFilter, courseFilter],
    () => assignmentService.getAllAssignments({
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      courseId: courseFilter !== 'all' ? courseFilter : undefined,
      userId: hasRole(['STUDENT']) ? user?.id : undefined
    }),
    {
      keepPreviousData: true
    }
  );

  const { data: courses } = useQuery(
    'user-courses',
    () => hasRole(['STUDENT']) 
      ? assignmentService.getStudentCourses(user?.id)
      : assignmentService.getInstructorCourses(user?.id),
    {
      enabled: !!user?.id
    }
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleCourseFilter = (courseId) => {
    setCourseFilter(courseId);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return <Loading text="Cargando tareas..." />;
  }

  const assignments = assignmentsData?.data || [];
  const totalPages = Math.ceil((assignmentsData?.total || 0) / itemsPerPage);

  const getStatusFilterOptions = () => {
    if (hasRole(['STUDENT'])) {
      return [
        { value: 'all', label: 'Todas' },
        { value: 'pending', label: 'Pendientes' },
        { value: 'submitted', label: 'Entregadas' },
        { value: 'graded', label: 'Calificadas' },
        { value: 'overdue', label: 'Vencidas' }
      ];
    } else {
      return [
        { value: 'all', label: 'Todas' },
        { value: 'ACTIVE', label: 'Activas' },
        { value: 'CLOSED', label: 'Cerradas' },
        { value: 'INACTIVE', label: 'Inactivas' }
      ];
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            {hasRole(['STUDENT']) ? 'Mis Tareas' : 'Gestión de Tareas'}
          </h1>
          <p className={styles.subtitle}>
            {hasRole(['STUDENT']) 
              ? 'Administra tus tareas y entregas'
              : 'Crea y gestiona las tareas de tus cursos'
            }
          </p>
        </div>
        {hasRole(['INSTRUCTOR', 'ADMIN']) && (
          <Button variant="primary" icon={<FaPlus />}>
            Nueva Tarea
          </Button>
        )}
      </div>

      <div className={styles.filters}>
        <div className={styles.searchSection}>
          <Input
            placeholder="Buscar tareas..."
            value={searchTerm}
            onChange={handleSearch}
            icon={<FaSearch />}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterSection}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Estado:</label>
            <div className={styles.statusFilters}>
              {getStatusFilterOptions().map(option => (
                <button
                  key={option.value}
                  className={`${styles.filterButton} ${statusFilter === option.value ? styles.active : ''}`}
                  onClick={() => handleStatusFilter(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {courses && courses.length > 0 && (
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Curso:</label>
              <select
                value={courseFilter}
                onChange={(e) => handleCourseFilter(e.target.value)}
                className={styles.courseSelect}
              >
                <option value="all">Todos los cursos</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyContent}>
            <FaCalendarAlt className={styles.emptyIcon} />
            <h3>No se encontraron tareas</h3>
            <p>
              {searchTerm || statusFilter !== 'all' || courseFilter !== 'all'
                ? 'No hay tareas que coincidan con los criterios de búsqueda.'
                : hasRole(['STUDENT'])
                  ? 'No tienes tareas asignadas en este momento.'
                  : 'No has creado ninguna tarea aún.'
              }
            </p>
            {hasRole(['INSTRUCTOR', 'ADMIN']) && !searchTerm && statusFilter === 'all' && courseFilter === 'all' && (
              <Button variant="primary" icon={<FaPlus />}>
                Crear Primera Tarea
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className={styles.assignmentsGrid}>
            {assignments.map(assignment => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                userRole={user?.roles?.[0]?.name}
                userId={user?.id}
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
  );
};

export default AssignmentList;
