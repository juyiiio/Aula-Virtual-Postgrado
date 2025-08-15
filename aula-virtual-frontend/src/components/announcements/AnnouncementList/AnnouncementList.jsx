import React, { useState, useEffect } from 'react';
import AnnouncementCard from '../AnnouncementCard/AnnouncementCard';
import Loading from '../../common/Loading/Loading';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import useAuth from '../../../hooks/useAuth';
import announcementService from '../../../services/announcementService';
import { searchInArray } from '../../../utils/helpers';
import styles from './AnnouncementList.module.css';

const AnnouncementList = ({ courseId }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const { hasRole } = useAuth();

  useEffect(() => {
    fetchAnnouncements();
  }, [courseId]);

  useEffect(() => {
    filterAnnouncements();
  }, [announcements, searchTerm, filter]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      let announcementsData = [];
      
      if (courseId) {
        announcementsData = await announcementService.getAnnouncementsByCourse(courseId);
      } else {
        announcementsData = await announcementService.getAnnouncements();
      }
      
      setAnnouncements(announcementsData);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAnnouncements = () => {
    let filtered = announcements;

    // Filtrar por estado
    if (filter !== 'all') {
      filtered = filtered.filter(announcement => {
        if (filter === 'published') return announcement.status === 'PUBLISHED';
        if (filter === 'draft') return announcement.status === 'DRAFT';
        if (filter === 'scheduled') return announcement.status === 'SCHEDULED';
        return true;
      });
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = searchInArray(filtered, searchTerm, ['title', 'content', 'summary']);
    }

    setFilteredAnnouncements(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  if (loading) {
    return <Loading message="Cargando anuncios..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Anuncios</h2>
        <div className={styles.actions}>
          {(hasRole('ADMIN') || hasRole('INSTRUCTOR')) && (
            <Button variant="primary">
              Nuevo Anuncio
            </Button>
          )}
        </div>
      </div>

      <div className={styles.filters}>
        <Input
          placeholder="Buscar anuncios..."
          value={searchTerm}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />

        <select
          value={filter}
          onChange={handleFilterChange}
          className={styles.filterSelect}
