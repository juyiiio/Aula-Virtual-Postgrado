import React, { useState, useEffect } from 'react';
import ConferenceCard from '../ConferenceCard/ConferenceCard';
import Loading from '../../common/Loading/Loading';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import useAuth from '../../../hooks/useAuth';
import { searchInArray } from '../../../utils/helpers';
import styles from './ConferenceList.module.css';

const ConferenceList = () => {
  const [conferences, setConferences] = useState([]);
  const [filteredConferences, setFilteredConferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const { hasRole } = useAuth();

  useEffect(() => {
    fetchConferences();
  }, []);

  useEffect(() => {
    filterConferences();
  }, [conferences, searchTerm, filter]);

  const fetchConferences = async () => {
    try {
      setLoading(true);
      // Simular datos de conferencias
      const mockConferences = [
        {
          id: 1,
          title: 'Clase Virtual - Matemáticas',
          description: 'Repaso de álgebra lineal',
          scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          duration: 90,
          status: 'SCHEDULED',
          host: { firstName: 'Dr. Juan', lastName: 'Pérez' },
          course: { name: 'Matemáticas Avanzadas' },
          participantsCount: 0
        },
        {
          id: 2,
          title: 'Seminario de Física',
          description: 'Mecánica cuántica',
          scheduledTime: new Date().toISOString(),
          duration: 120,
          status: 'LIVE',
          host: { firstName: 'Dra. María', lastName: 'González' },
          course: { name: 'Física Cuántica' },
          participantsCount: 15
        }
      ];
      
      setConferences(mockConferences);
    } catch (error) {
      console.error('Error fetching conferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterConferences = () => {
    let filtered = conferences;

    // Filtrar por estado
    if (filter !== 'all') {
      filtered = filtered.filter(conf => conf.status.toLowerCase() === filter);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = searchInArray(filtered, searchTerm, ['title', 'description']);
    }

    setFilteredConferences(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  if (loading) {
    return <Loading message="Cargando conferencias..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Videoconferencias</h2>
        <div className={styles.actions}>
          {hasRole('INSTRUCTOR') && (
            <Button variant="primary">
              Nueva Conferencia
            </Button>
          )}
        </div>
      </div>

      <div className={styles.filters}>
        <Input
          placeholder="Buscar conferencias..."
          value={searchTerm}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />

        <select
          value={filter}
          onChange={handleFilterChange}
          className={styles.filterSelect}
        >
          <option value="all">Todas</option>
          <option value="live">En vivo</option>
          <option value="scheduled">Programadas</option>
          <option value="ended">Finalizadas</option>
        </select>
      </div>

      {filteredConferences.length > 0 ? (
        <div className={styles.conferenceGrid}>
          {filteredConferences.map(conference => (
            <ConferenceCard
              key={conference.id}
              conference={conference}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>
            {searchTerm || filter !== 'all' 
              ? 'No se encontraron conferencias' 
              : 'No hay conferencias disponibles'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ConferenceList;
