import React, { useState, useEffect } from 'react';
import ForumCard from '../ForumCard/ForumCard';
import Loading from '../../common/Loading/Loading';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import useAuth from '../../../hooks/useAuth';
import forumService from '../../../services/forumService';
import { searchInArray } from '../../../utils/helpers';
import styles from './ForumList.module.css';

const ForumList = ({ courseId }) => {
  const [forums, setForums] = useState([]);
  const [filteredForums, setFilteredForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { hasRole } = useAuth();

  useEffect(() => {
    const fetchForums = async () => {
      try {
        setLoading(true);
        let forumsData = [];
        
        if (courseId) {
          forumsData = await forumService.getForumsByCourse(courseId);
        } else {
          forumsData = await forumService.getForums();
        }
        
        setForums(forumsData);
        setFilteredForums(forumsData);
      } catch (error) {
        console.error('Error fetching forums:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchForums();
  }, [courseId]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = searchInArray(forums, searchTerm, ['title', 'description']);
      setFilteredForums(filtered);
    } else {
      setFilteredForums(forums);
    }
  }, [searchTerm, forums]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return <Loading message="Cargando foros..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Foros</h2>
        <div className={styles.actions}>
          <Input
            placeholder="Buscar foros..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
          {hasRole('INSTRUCTOR') && (
            <Button variant="primary">
              Nuevo Foro
            </Button>
          )}
        </div>
      </div>

      {filteredForums.length > 0 ? (
        <div className={styles.forumGrid}>
          {filteredForums.map(forum => (
            <ForumCard
              key={forum.id}
              forum={forum}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>
            {searchTerm ? 'No se encontraron foros' : 'No hay foros disponibles'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ForumList;
