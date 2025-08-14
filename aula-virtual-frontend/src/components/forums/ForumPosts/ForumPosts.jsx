import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PostCard from '../PostCard/PostCard';
import PostForm from '../PostForm/PostForm';
import Loading from '../../common/Loading/Loading';
import Button from '../../common/Button/Button';
import Card from '../../common/Card/Card';
import Modal from '../../common/Modal/Modal';
import useAuth from '../../../hooks/useAuth';
import forumService from '../../../services/forumService';
import useNotification from '../../../hooks/useNotification';
import styles from './ForumPosts.module.css';

const ForumPosts = () => {
  const { id } = useParams();
  const [forum, setForum] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const { user, hasRole } = useAuth();
  const { showError, showSuccess } = useNotification();

  useEffect(() => {
    fetchForumData();
  }, [id]);

  const fetchForumData = async () => {
    try {
      setLoading(true);
      const [forumData, postsData] = await Promise.all([
        forumService.getForumById(id),
        forumService.getForumPosts(id)
      ]);

      setForum(forumData);
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching forum data:', error);
      showError('Error al cargar el foro');
    } finally {
      setLoading(false);
    }
  };

  const handleNewPost = async (postData) => {
    try {
      await forumService.createPost(id, postData);
      showSuccess('Post creado exitosamente');
      setShowPostModal(false);
      fetchForumData();
    } catch (error) {
      const message = error?.response?.data?.message || 'Error al crear el post';
      showError(message);
    }
  };

  const handleReply = async (postId, replyData) => {
    try {
      await forumService.replyToPost(postId, replyData);
      showSuccess('Respuesta enviada exitosamente');
      fetchForumData();
    } catch (error) {
      const message = error?.response?.data?.message || 'Error al enviar la respuesta';
      showError(message);
    }
  };

  if (loading) {
    return <Loading message="Cargando foro..." />;
  }

  if (!forum) {
    return (
      <div className={styles.error}>
        <p>Foro no encontrado</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.forumInfo}>
          <h1 className={styles.forumTitle}>{forum.title}</h1>
          <p className={styles.forumDescription}>{forum.description}</p>
          <div className={styles.forumMeta}>
            <span className={styles.forumType}>{forum.forumType}</span>
            <span className={styles.postsCount}>{posts.length} posts</span>
          </div>
        </div>
        
        <div className={styles.actions}>
          <Button
            variant="primary"
            onClick={() => setShowPostModal(true)}
          >
            Nuevo Post
          </Button>
        </div>
      </div>

      {posts.length > 0 ? (
        <div className={styles.posts}>
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onReply={handleReply}
            />
          ))}
        </div>
      ) : (
        <Card className={styles.emptyState}>
          <div className={styles.emptyContent}>
            <h3>No hay posts en este foro</h3>
            <p>Sé el primero en iniciar una conversación</p>
            <Button
              variant="primary"
              onClick={() => setShowPostModal(true)}
            >
              Crear Primer Post
            </Button>
          </div>
        </Card>
      )}

      <Modal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        title="Nuevo Post"
        size="large"
      >
        <PostForm
          onSubmit={handleNewPost}
          onCancel={() => setShowPostModal(false)}
        />
      </Modal>
    </div>
  );
};

export default ForumPosts;
