import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../../../context/AuthContext';
import ExamCard from '../ExamCard/ExamCard';
import Loading from '../../common/Loading/Loading';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import { FaSearch, FaFilter, FaPlus, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { examService } from '../../../services/examService';
import styles from './ExamList.module.css';

const ExamList = () => {
  const { user, hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { data: examsData, isLoading, refetch } = useQuery(
    ['exams', currentPage, searchTerm, statusFilter, typeFilter, courseFilter, user?.id],
    () => {
      if (hasRole(['STUDENT'])) {
        return examService.getStudentExams(user?.id, {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          type: typeFilter !== 'all' ? typeFilter : undefined,
          courseId: courseFilter !== 'all' ? courseFilter : undefined
        });
      } else {
        return examService.getInstructorExams(user?.id, {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          type: typeFilter !== 'all' ? typeFilter : undefined,
          courseId: courseFilter !== 'all' ? courseFilter : undefined
        });
      }
    },
    {
      keepPreviousData: true
    }
  );

  const { data: userCourses } = useQuery(
    ['user-courses', user?.id],
    () => {
      if (hasRole(['STUDENT'])) {
        return examService.getStudentCourses(user?.id);
      } else {
        return examService.getInstructorCourses(user?.id);
      }
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

  const handleTypeFilter = (e) => {
    setTypeFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleCourseFilter = (e) => {
    setCourseFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return <Loading text="Cargando exámenes..." />;
  }

  const exams = examsData?.data || [];
  const totalPages = Math.ceil((examsData?.total || 0) / itemsPerPage);

  const getStatusFilters = () => {
    if (hasRole(['STUDENT'])) {
      return [
        { id: 'all', label: 'Todos' },
        { id: 'upcoming', label: 'Próximos' },
        { id: 'available', label: 'Disponibles' },
        { id: 'completed', label: 'Completados' },
        { id: 'overdue', label: 'Perdidos' }
      ];
    } else {
      return [
        { id: 'all', label: 'Todos' },
        { id: 'draft', label: 'Borradores' },
        { id: 'scheduled', label: 'Programados' },
        { id: 'active', label: 'Activos' },
        { id: 'completed', label: 'Finalizados' }
      ];
    }
  };

  const getUpcomingExams = () => {
    const now = new Date();
    return exams.filter(exam => {
      const startTime = new Date(exam.startTime);
      const diff = startTime - now;
      return diff > 0 && diff <= 24 * 60 * 60 * 1000; // Next 24 hours
    });
  };

  const upcomingExams = getUpcomingExams();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            {hasRole(['STUDENT']) ? 'Mis Exámenes' : 'Gestión de Exámenes'}
          </h1>
          <p className={styles.subtitle}>
            {hasRole(['STUDENT']) 
              ? 'Revisa y realiza tus exámenes programados'
              : 'Administra los exámenes de tus cursos'
            }
          </p>
        </div>
        {hasRole(['INSTRUCTOR', 'ADMIN']) && (
          <div className={styles.headerActions}>
            <Button variant="primary" icon={<FaPlus />}>
              Nuevo Examen
            </Button>
            <Button variant="outline" icon={<FaCalendarAlt />}>
              Calendario
            </Button>
          </div>
        )}
      </div>

      {upcomingExams.length > 0 && hasRole(['STUDENT']) && (
        <div className={styles.upcomingSection}>
          <div className={styles.upcomingHeader}>
            <FaClock className={styles.upcomingIcon} />
            <h3>Exámenes Próximos (24 horas)</h3>
          </div>
          <div className={styles.upcomingGrid}>
            {upcomingExams.slice(0, 3).map(exam => (
              <div key={exam.id} className={styles.upcomingCard}>
                <div className={styles.upcomingInfo}>
                  <h4>{exam.title}</h4>
                  <p>{exam.course?.name}</p>
                  <span className={styles.upcomingTime}>
                    {new Date(exam.startTime).toLocaleString('es-ES')}
                  </span>
                </div>
                <Button size="small" variant="primary">
                  Ver Examen
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.filters}>
        <div className={styles.searchSection}>
          <Input
            placeholder="Buscar exámenes..."
            value={searchTerm}
            onChange={handleSearch}
            icon={<FaSearch />}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterSection}>
          <div className={styles.statusFilters}>
            {getStatusFilters().map(filter => (
              <button
                key={filter.id}
                className={`${styles.filterButton} ${statusFilter === filter.id ? styles.active : ''}`}
                onClick={() => handleStatusFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
          
          <div className={styles.selectFilters}>
            <select
              value={typeFilter}
              onChange={handleTypeFilter}
              className={styles.filterSelect}
            >
              <option value="all">Todos los tipos</option>
              <option value="PARCIAL">Parciales</option>
              <option value="FINAL">Finales</option>
              <option value="SUSTITUTORIO">Sustitutorios</option>
              <option value="EXTRAORDINARIO">Extraordinarios</option>
            </select>

            {userCourses && userCourses.length > 1 && (
              <select
                value={courseFilter}
                onChange={handleCourseFilter}
                className={styles.filterSelect}
              >
                <option value="all">Todos los cursos</option>
                {userCourses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {exams.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyContent}>
            <h3>No se encontraron exámenes</h3>
            <p>
              {searchTerm 
                ? 'No hay exámenes que coincidan con los criterios de búsqueda.'
                : hasRole(['STUDENT'])
                  ? 'No tienes exámenes programados en este momento.'
                  : 'No has creado exámenes aún.'
              }
            </p>
            {hasRole(['INSTRUCTOR', 'ADMIN']) && !searchTerm && (
              <Button variant="primary" icon={<FaPlus />}>
                Crear Primer Examen
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className={styles.examsGrid}>
            {exams.map(exam => (
              <ExamCard
                key={exam.id}
                exam={exam}
                userRole={hasRole(['STUDENT']) ? 'student' : 'instructor'}
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

export default ExamList;
