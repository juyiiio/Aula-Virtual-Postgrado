import React, { useState, useEffect } from 'react';
import ResourceCard from '../ResourceCard/ResourceCard';
import Loading from '../../common/Loading/Loading';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import Modal from '../../common/Modal/Modal';
import ResourceUpload from '../ResourceUpload/ResourceUpload';
import useAuth from '../../../hooks/useAuth';
import fileService from '../../../services/fileService';
import { searchInArray } from '../../../utils/helpers';
import styles from './ResourceList.module.css';

const ResourceList = ({ courseId }) => {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { hasRole } = useAuth();

  useEffect(() => {
    fetchResources();
  }, [courseId]);

  useEffect(() => {
    filterResources();
  }, [resources, searchTerm, categoryFilter]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      let resourcesData = [];
      
      if (courseId) {
        resourcesData = await fileService.getResourcesByCourse(courseId);
      } else {
        resourcesData = await fileService.getResources();
      }
      
      setResources(resourcesData);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    // Filtrar por categoría
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(resource => resource.category === categoryFilter);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = searchInArray(filtered, searchTerm, ['name', 'description', 'tags']);
    }

    setFilteredResources(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    fetchResources();
  };

  if (loading) {
    return <Loading message="Cargando recursos..." />;
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Recursos</h2>
          <div className={styles.actions}>
            {(hasRole('ADMIN') || hasRole('INSTRUCTOR')) && (
              <Button 
                variant="primary"
                onClick={() => setShowUploadModal(true)}
              >
                📤 Subir Recurso
              </Button>
            )}
          </div>
        </div>

        <div className={styles.filters}>
          <Input
            placeholder="Buscar recursos..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />

          <select
            value={categoryFilter}
            onChange={handleCategoryFilterChange}
            className={styles.filterSelect}
          >
            <option value="all">Todas las categorías</option>
            <option value="DOCUMENT">Documentos</option>
            <option value="VIDEO">Videos</option>
            <option value="AUDIO">Audio</option>
            <option value="IMAGE">Imágenes</option>
            <option value="PRESENTATION">Presentaciones</option>
            <option value="SPREADSHEET">Hojas de cálculo</option>
            <option value="OTHER">Otros</option>
          </select>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{filteredResources.length}</span>
            <span className={styles.statLabel}>Recursos encontrados</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>
              {resources.reduce((total, resource) => total + (resource.downloadCount || 0), 0)}
            </span>
            <span className={styles.statLabel}>Descargas totales</span>
          </div>
        </div>

        {filteredResources.length > 0 ? (
          <div className={styles.resourcesGrid}>
            {filteredResources.map(resource => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onUpdate={fetchResources}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p className={styles.emptyMessage}>
              {searchTerm || categoryFilter !== 'all' 
                ? 'No se encontraron recursos con los filtros aplicados'
                : 'No hay recursos disponibles'}
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Subir Nuevo Recurso"
        size="large"
      >
        <ResourceUpload
          courseId={courseId}
          onSuccess={handleUploadSuccess}
          onCancel={() => setShowUploadModal(false)}
        />
      </Modal>
    </>
  );
};

export default ResourceList;
