import React, { useState, useEffect } from 'react';
import AssignmentCard from '../AssignmentCard/AssignmentCard';
import Loading from '../../common/Loading/Loading';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import useAuth from '../../../hooks/useAuth';
import assignmentService from '../../../services/assignmentService';
import { searchInArray } from '../../../utils/helpers';
import styles from './AssignmentList.module.css';

const AssignmentList = ({ courseId }) => {
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, hasRole } = useAuth();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        let assignmentsData = [];
        
        if (courseId) {
          assignmentsData = await assignmentService.getAssignmentsByCourse(courseId);
        } else if (hasRole('STUDENT')) {
          assignmentsData = await assignmentService.getStudentAssignments(user.id);
        } else {
          assignmentsData = await assignmentService.getAssignments();
        }
        
        setAssignments(assignmentsData);
        setFilteredAssignments(assignmentsData);
      } catch (error) {
        console.error('Error fetching assignments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [courseId, user, hasRole]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = searchInArray(assignments, searchTerm, ['title', 'description']);
      setFilteredAssignments(filtered);
    } else {
      setFilteredAssignments(assignments);
    }
  }, [searchTerm, assignments]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return <Loading message="Cargando tareas..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Tareas</h2>
        <div className={styles.actions}>
          <Input
            placeholder="Buscar tareas..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
          {hasRole('INSTRUCTOR') && (
            <Button variant="primary">
              Nueva Tarea
            </Button>
          )}
        </div>
      </div>

      {filteredAssignments.length > 0 ? (
        <div className={styles.assignmentGrid}>
          {filteredAssignments.map(assignment => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>
            {searchTerm ? 'No se encontraron tareas' : 'No hay tareas disponibles'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AssignmentList;
