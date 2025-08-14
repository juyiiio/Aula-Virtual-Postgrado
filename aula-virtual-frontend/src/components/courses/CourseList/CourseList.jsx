import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../../../context/AuthContext';
import CourseCard from '../CourseCard/CourseCard';
import Loading from '../../common/Loading/Loading';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import { FaSearch, FaFilter, FaPlus } from 'react-icons/fa';
import { courseService } from '../../../services/courseService';
import styles from './CourseList.module.css';

const CourseList = () => {
  const { user, hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { data: coursesData, isLoading, refetch } = useQuery(
    ['courses', currentPage, searchTerm, statusFilter],
    () => courseService.getAllCourses({
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm,
      status: statusFilter !== 'all' ? statusFilter : undefined
    }),
    {
      keepPreviousData: true
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return <Loading text="Cargando cursos..." />;
  }

  const courses = coursesData?.data || [];
  const totalPages = Math.ceil((coursesData?.total || 0) / itemsPerPage);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Cursos</h1>
          <p className={styles.subtitle}>
            Explora y gestiona los cursos disponibles
          </p>
        </div>
        {hasRole(['ADMIN', 'INSTRUCTOR']) && (
          <Button variant="primary" icon={<FaPlus />}>
            Crear Curso
          </Button>
        )}
      </div>

      <div className={styles.filters}>
        <div className={styles.searchSection}>
          <Input
            placeholder="Buscar cursos..."
            value={searchTerm}
            onChange={handleSearch}
            icon={<FaSearch />}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterSection}>
          <div className={styles.statusFilters}>
            <button
              className={`${styles.filterButton} ${statusFilter === 'all' ? styles.active : ''}`}
              onClick={() => handleStatusFilter('all')}
            >
              Todos
            </button>
            <button
              className={`${styles.filterButton} ${statusFilter === 'ACTIVE' ? styles.active : ''}`}
              onClick={() => handleStatusFilter('ACTIVE')}
            >
              Activos
            </button>
            <button
              className={`${styles.filterButton} ${statusFilter === 'COMPLETED' ? styles.active : ''}`}
              onClick={() => handleStatusFilter('COMPLETED')}
            >
              Completados
            </button>
            <button
              className={`${styles.filterButton} ${statusFilter === 'INACTIVE' ? styles.active : ''}`}
              onClick={() => handleStatusFilter('INACTIVE')}
            >
              Inactivos
            </button>
          </div>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyContent}>
            <h3>No se encontraron cursos</h3>
            <p>No hay cursos que coincidan con los criterios de búsqueda.</p>
            {hasRole(['ADMIN', 'INSTRUCTOR']) && (
              <Button variant="primary" icon={<FaPlus />}>
                Crear Primer Curso
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className={styles.coursesGrid}>
            {courses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
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

export default CourseList;
