import React, { useState, useEffect } from 'react';
import ExamCard from '../ExamCard/ExamCard';
import Loading from '../../common/Loading/Loading';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import useAuth from '../../../hooks/useAuth';
import examService from '../../../services/examService';
import { searchInArray } from '../../../utils/helpers';
import styles from './ExamList.module.css';

const ExamList = ({ courseId }) => {
const [exams, setExams] = useState([]);
const [filteredExams, setFilteredExams] = useState([]);
const [loading, setLoading] = useState(true);
const [searchTerm, setSearchTerm] = useState('');
const { user, hasRole } = useAuth();

useEffect(() => {
    const fetchExams = async () => {
    try {
        setLoading(true);
        let examsData = [];
        
        if (courseId) {
        examsData = await examService.getExamsByCourse(courseId);
        } else if (hasRole('STUDENT')) {
        examsData = await examService.getStudentExams(user.id);
        } else {
        examsData = await examService.getExams();
        }
        
        setExams(examsData);
        setFilteredExams(examsData);
    } catch (error) {
        console.error('Error fetching exams:', error);
    } finally {
        setLoading(false);
    }
    };

    fetchExams();
}, [courseId, user, hasRole]);

useEffect(() => {
    if (searchTerm) {
    const filtered = searchInArray(exams, searchTerm, ['title', 'description', 'examType']);
    setFilteredExams(filtered);
    } else {
    setFilteredExams(exams);
    }
}, [searchTerm, exams]);

const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
};

if (loading) {
    return <Loading message="Cargando exámenes..." />;
}

return (
    <div className={styles.container}>
    <div className={styles.header}>
        <h2 className={styles.title}>Exámenes</h2>
        <div className={styles.actions}>
        <Input
            placeholder="Buscar exámenes..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
        />
        {hasRole('INSTRUCTOR') && (
            <Button variant="primary">
            Nuevo Examen
            </Button>
        )}
        </div>
    </div>

    {filteredExams.length > 0 ? (
        <div className={styles.examGrid}>
        {filteredExams.map(exam => (
            <ExamCard
            key={exam.id}
            exam={exam}
            />
        ))}
        </div>
    ) : (
        <div className={styles.emptyState}>
        <p className={styles.emptyMessage}>
            {searchTerm ? 'No se encontraron exámenes' : 'No hay exámenes disponibles'}
        </p>
        </div>
    )}
    </div>
);
};

export default ExamList;
