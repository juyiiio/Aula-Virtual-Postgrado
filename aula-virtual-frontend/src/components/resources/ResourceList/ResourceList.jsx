import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../../../context/AuthContext';
import ResourceCard from '../ResourceCard/ResourceCard';
import ResourceUpload from '../ResourceUpload/ResourceUpload';
import Loading from '../../common/Loading/Loading';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import Modal from '../../common/Modal/Modal';
import { 
  FaSearch, 
  FaFilter, 
  FaPlus, 
  FaDownload, 
  FaFolderOpen,
  FaFile,
  FaImage,
  FaVideo,
  FaFileAudio,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileArchive,
  FaCloudUploadAlt,
  FaSort
} from 'react-icons/fa';
import { resourceService } from '../../../services/resourceService';
import styles from './ResourceList.module.css';

const ResourceList = () => {
  const { user, hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [currentPage, setCurrentPage] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const itemsPerPage = 24;

  const { data: resourcesData, isLoading, refetch } = useQuery(
    ['resources', currentPage, searchTerm, typeFilter, categoryFilter, sortBy],
    () => resourceService.getAllResources({
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm,
      type: typeFilter !== 'all' ? typeFilter : undefined,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      sortBy
    }),
    {
      keepPreviousData: true
    }
  );

  const { data: categories } = useQuery(
    'resource-categories',
    () => resourceService.getResourceCategories()
  );

  const { data: statistics } = useQuery(
    'resource-statistics',
    () => resourceService.getResourceStatistics()
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleTypeFilter = (e) => {
    setTypeFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    refetch();
  };

  const getFileTypeIcon = (type) => {
    const iconMap = {
      'image': <FaImage />,
      'video': <FaVideo />,
      'audio': <FaFileAudio />,
      'pdf': <FaFilePdf />,
      'document': <FaFileWord />,
      'spreadsheet': <FaFileExcel />,
      'presentation': <FaFilePowerpoint />,
      'archive': <FaFileArchive />,
      'other': <FaFile />
    };
    return iconMap[type] || iconMap['other'];
  };

  const getStorageUsage = () => {
    if (!statistics) return { used: 0, total: 0, percentage: 0 };
    
    const used = statistics.totalSize || 0;
    const total = statistics.storageLimit || 5368709120; // 5GB default
    const percentage = Math.round((used / total) * 100);
    
    return { used, total, percentage };
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return <Loading text="Cargando recursos..." />;
  }

  const resources = resourcesData?.data || [];
  const totalPages = Math.ceil((resourcesData?.total || 0) / itemsPerPage);
  const storageUsage = getStorageUsage();

  const typeFilters = [
    { value: 'all', label: 'Todos los tipos', icon: <FaFile /> },
    { value: 'image', label: 'Imágenes', icon: <FaImage /> },
    { value: 'video', label: 'Videos', icon: <FaVideo /> },
    { value: 'audio', label: 'Audio', icon: <FaFileAudio /> },
    { value: 'pdf', label: 'PDF', icon: <FaFilePdf /> },
    { value: 'document', label: 'Documentos', icon: <FaFileWord /> },
    { value: 'presentation', label: 'Presentaciones', icon: <FaFilePowerpoint /> },
    { value: 'archive', label: 'Archivos', icon: <FaFileArchive /> }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <FaFolderOpen className={styles.titleIcon} />
            Biblioteca de Recursos
          </h1>
          <p className={styles.subtitle}>
            Accede, organiza y comparte recursos educativos
          </p>
        </div>
        {hasRole(['INSTRUCTOR', 'ADMIN']) && (
          <Button
            variant="primary"
            icon={<FaPlus />}
            onClick={() => setShowUploadModal(true)}
          >
            Subir Recurso
          </Button>
        )}
      </div>

      <div className={styles.mainContent}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarHeader}>
              <FaCloudUploadAlt className={styles.sidebarIcon} />
              <h3>Almacenamiento</h3>
            </div>
            <div className={styles.storageInfo}>
              <div className={styles.storageBar}>
                <div 
                  className={styles.storageUsed}
                  style={{ width: `${Math.min(storageUsage.percentage, 100)}%` }}
                ></div>
              </div>
              <div className={styles.storageText}>
                <span>{formatFileSize(storageUsage.used)} de {formatFileSize(storageUsage.total)} usados</span>
                <span className={styles.storagePercentage}>{storageUsage.percentage}%</span>
              </div>
            </div>
          </div>

          <div className={styles.sidebarCard}>
            <div className={styles.sidebarHeader}>
              <FaFilter className={styles.sidebarIcon} />
              <h3>Filtrar por Tipo</h3>
            </div>
            <div className={styles.typeFilters}>
              {typeFilters.map(filter => (
                <button
                  key={filter.value}
                  className={`${styles.typeFilterButton} ${typeFilter === filter.value ? styles.active : ''}`}
                  onClick={() => {
                    setTypeFilter(filter.value);
                    setCurrentPage(1);
                  }}
                >
                  {filter.icon}
                  <span>{filter.label}</span>
                  <span className={styles.typeCount}>
                    {filter.value === 'all' 
                      ? statistics?.totalResources || 0
                      : statistics?.typeCount?.[filter.value] || 0
                    }
                  </span>
                </button>
              ))}
            </div>
          </div>

          {statistics && (
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarHeader}>
                <FaFile className={styles.sidebarIcon} />
                <h3>Estadísticas</h3>
              </div>
              <div className={styles.statsContent}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{statistics.totalResources || 0}</span>
                  <span className={styles.statLabel}>Total de archivos</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{statistics.totalDownloads || 0}</span>
                  <span className={styles.statLabel}>Descargas</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{formatFileSize(statistics.totalSize || 0)}</span>
                  <span className={styles.statLabel}>Espacio usado</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.resourcesSection}>
          <div className={styles.filtersHeader}>
            <div className={styles.searchAndFilters}>
              <div className={styles.searchFilter}>
                <Input
                  placeholder="Buscar recursos..."
                  value={searchTerm}
                  onChange={handleSearch}
                  icon={<FaSearch />}
                  className={styles.searchInput}
                />
              </div>
              
              <div className={styles.dropdownFilters}>
                <select
                  value={categoryFilter}
                  onChange={handleCategoryFilter}
                  className={styles.categorySelect}
                >
                  <option value="all">Todas las categorías</option>
                  {categories?.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className={styles.sortSelect}
                >
                  <option value="recent">Más recientes</option>
                  <option value="name">Nombre A-Z</option>
                  <option value="size">Tamaño</option>
                  <option value="downloads">Más descargados</option>
                  <option value="type">Tipo de archivo</option>
                </select>
              </div>
            </div>
            
            <div className={styles.viewControls}>
              <div className={styles.viewModeButtons}>
                <button
                  className={`${styles.viewModeButton} ${viewMode === 'grid' ? styles.active : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Vista en cuadrícula"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="1" y="1" width="6" height="6" rx="1"/>
                    <rect x="9" y="1" width="6" height="6" rx="1"/>
                    <rect x="1" y="9" width="6" height="6" rx="1"/>
                    <rect x="9" y="9" width="6" height="6" rx="1"/>
                  </svg>
                </button>
                <button
                  className={`${styles.viewModeButton} ${viewMode === 'list' ? styles.active : ''}`}
                  onClick={() => setViewMode('list')}
                  title="Vista en lista"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="1" y="2" width="14" height="2" rx="1"/>
                    <rect x="1" y="6" width="14" height="2" rx="1"/>
                    <rect x="1" y="10" width="14" height="2" rx="1"/>
                    <rect x="1" y="14" width="14" height="2" rx="1"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {resources.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyContent}>
                <FaFolderOpen className={styles.emptyIcon} />
                <h3>No se encontraron recursos</h3>
                <p>
                  {searchTerm 
                    ? 'No hay recursos que coincidan con los criterios de búsqueda.'
                    : 'Aún no hay recursos disponibles. ¡Sé el primero en subir uno!'
                  }
                </p>
                {hasRole(['INSTRUCTOR', 'ADMIN']) && !searchTerm && (
                  <Button 
                    variant="primary" 
                    icon={<FaPlus />}
                    onClick={() => setShowUploadModal(true)}
                  >
                    Subir Primer Recurso
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className={`${styles.resourcesGrid} ${styles[viewMode]}`}>
                {resources.map(resource => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    viewMode={viewMode}
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
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Subir Nuevo Recurso"
        size="large"
      >
        <ResourceUpload
          onSuccess={handleUploadSuccess}
          onCancel={() => setShowUploadModal(false)}
          categories={categories}
        />
      </Modal>
    </div>
  );
};

export default ResourceList;
