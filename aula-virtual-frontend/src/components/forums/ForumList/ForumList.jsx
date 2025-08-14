import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../../../context/AuthContext';
import ForumCard from '../ForumCard/ForumCard';
import Loading from '../../common/Loading/Loading';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import { FaSearch, FaFilter, FaPlus, FaComments, FaFire, FaClock } from 'react-icons/fa';
import { forumService } from '../../../services/forumService';
import styles from './ForumList.module.css';

const ForumList = () => {
  const { user, hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { data: forumsData, isLoading, refetch } = useQuery(
    ['forums', currentPage, searchTerm, categoryFilter, sortBy],
    () => forumService.getAllForums({
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      sortBy
    }),
    {
      keepPreviousData: true
    }
  );

  const { data: categories } = useQuery(
    'forum-categories',
    () => forumService.getForumCategories()
  );

  const { data: popularTopics } = useQuery(
    'popular-topics',
    () => forumService.getPopularTopics({ limit: 5 })
  );

  const { data: recentActivity } = useQuery(
    'recent-forum-activity',
    () => forumService.getRecentActivity({ limit: 10 })
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
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

  if (isLoading) {
    return <Loading text="Cargando foros..." />;
  }

  const forums = forumsData?.data || [];
  const totalPages = Math.ceil((forumsData?.total || 0) / itemsPerPage);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Foros de Discusión</h1>
          <p className={styles.subtitle}>
            Participa en discusiones académicas y comparte conocimiento con la comunidad
          </p>
        </div>
        {hasRole(['INSTRUCTOR', 'ADMIN']) && (
          <Button variant="primary" icon={<FaPlus />}>
            Crear Foro
          </Button>
        )}
      </div>

      <div className={styles.mainContent}>
        <div className={styles.forumsSection}>
          <div className={styles.filters}>
            <div className={styles.searchSection}>
              <Input
                placeholder="Buscar en foros..."
                value={searchTerm}
                onChange={handleSearch}
                icon={<FaSearch />}
                className={styles.searchInput}
              />
            </div>
            
            <div className={styles.filterSection}>
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
                <option value="popular">Más populares</option>
                <option value="active">Más activos</option>
                <option value="alphabetical">Alfabético</option>
              </select>
            </div>
          </div>

          {forums.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyContent}>
                <FaComments className={styles.emptyIcon} />
                <h3>No se encontraron foros</h3>
                <p>
                  {searchTerm 
                    ? 'No hay foros que coincidan con los criterios de búsqueda.'
                    : 'Aún no hay foros creados. ¡Sé el primero en crear uno!'
                  }
                </p>
                {hasRole(['INSTRUCTOR', 'ADMIN']) && !searchTerm && (
                  <Button variant="primary" icon={<FaPlus />}>
                    Crear Primer Foro
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className={styles.forumsGrid}>
                {forums.map(forum => (
                  <ForumCard
                    key={forum.id}
                    forum={forum}
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

        <div className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarHeader}>
              <FaFire className={styles.sidebarIcon} />
              <h3>Temas Populares</h3>
            </div>
            <div className={styles.popularTopics}>
              {popularTopics?.map(topic => (
                <div key={topic.id} className={styles.popularTopic}>
                  <div className={styles.topicInfo}>
                    <h4 className={styles.topicTitle}>{topic.title}</h4>
                    <p className={styles.topicForum}>{topic.forum?.name}</p>
                  </div>
                  <div className={styles.topicStats}>
                    <span className={styles.topicReplies}>
                      {topic.repliesCount} respuestas
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.sidebarCard}>
            <div className={styles.sidebarHeader}>
              <FaClock className={styles.sidebarIcon} />
              <h3>Actividad Reciente</h3>
            </div>
            <div className={styles.recentActivity}>
              {recentActivity?.map(activity => (
                <div key={activity.id} className={styles.activityItem}>
                  <div className={styles.activityUser}>
                    <div className={styles.userAvatar}>
                      {activity.user.profilePicture ? (
                        <img src={activity.user.profilePicture} alt={activity.user.firstName} />
                      ) : (
                        <span>{activity.user.firstName.charAt(0)}</span>
                      )}
                    </div>
                    <div className={styles.activityContent}>
                      <p className={styles.activityText}>
                        <strong>{activity.user.firstName}</strong> {activity.action}
                      </p>
                      <p className={styles.activityTime}>
                        {new Date(activity.createdAt).toLocaleString('es-ES')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.sidebarCard}>
            <div className={styles.sidebarHeader}>
              <FaComments className={styles.sidebarIcon} />
              <h3>Estadísticas</h3>
            </div>
            <div className={styles.forumStats}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{forumsData?.totalForums || 0}</span>
                <span className={styles.statLabel}>Foros</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{forumsData?.totalTopics || 0}</span>
                <span className={styles.statLabel}>Temas</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{forumsData?.totalPosts || 0}</span>
                <span className={styles.statLabel}>Mensajes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumList;
