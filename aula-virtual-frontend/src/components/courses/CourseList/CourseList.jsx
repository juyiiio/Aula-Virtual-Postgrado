import React, { useState, useEffect } from 'react';
import CourseCard from '../CourseCard/CourseCard';
import Loading from '../../common/Loading/Loading';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import useAuth from '../../../hooks/useAuth';
import courseService from '../../../services/courseService';
import { searchInArray } from '../../../utils/helpers';
import styles from './CourseList.module.css';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, hasRole } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        let coursesData = [];
        
        if (hasRole('STUDENT')) {
          coursesData = await courseService.getStudentCourses(user.id);
        } else if (hasRole('INSTRUCTOR')) {
          coursesData = await courseService.getInstructorCourses(user.id);
        } else {
          coursesData = await courseService.getCourses();
        }
        
        setCourses(coursesData);
        setFilteredCourses(coursesData);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user, hasRole]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = searchInArray(courses, searchTerm, ['name', 'code', 'description']);
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
  }, [searchTerm, courses]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return <Loading message="Cargando cursos..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Mis Cursos</h2>
        <div className={styles.actions}>
          <Input
            placeholder="Buscar cursos..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
          {hasRole('ADMIN') && (
            <Button variant="primary">
              Nuevo Curso
            </Button>
          )}
        </div>
      </div>

      {filteredCourses.length > 0 ? (
        <div className={styles.courseGrid}>
          {filteredCourses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>
            {searchTerm ? 'No se encontraron cursos' : 'No hay cursos disponibles'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CourseList;
