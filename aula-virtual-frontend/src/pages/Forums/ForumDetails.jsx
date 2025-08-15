import React from 'react';
import { useParams } from 'react-router-dom';
import ForumPosts from '../../components/forums/ForumPosts/ForumPosts';
import styles from './Forums.module.css';

const ForumDetails = () => {
  const { id } = useParams();

  return (
    <div className={styles.container}>
      <ForumPosts forumId={id} />
    </div>
  );
};

export default ForumDetails;
