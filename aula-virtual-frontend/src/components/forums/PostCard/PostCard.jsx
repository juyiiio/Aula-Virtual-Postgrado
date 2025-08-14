import React, { useState } from 'react';
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import PostForm from '../PostForm/PostForm';
import useAuth from '../../../hooks/useAuth';
import { formatDateTime } from '../../../utils/dateUtils';
import { getInitials } from '../../../utils/helpers';
import styles from './PostCard.module.css';

const PostCard = ({ post, onReply }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const { user } = useAuth();

  const {
    id,
    title,
    content,
    author,
    createdAt,
    updatedAt,
    isPinned,
    replies = []
  } = post;

  const handleReply = async (replyData) => {
    await onReply(id, replyData);
    setShowReplyForm(false);
  };

  return (
    <Card className={`${styles.post} ${isPinned ? styles.pinned : ''}`}>
      {isPinned && (
        <div className={styles.pinnedBadge}>
          📌 Post Fijado
        </div>
      )}

      <div className={styles.postHeader}>
        <div className={styles.authorInfo}>
          <div className={styles.avatar}>
            {author?.profilePicture ? (
              <img src={author.profilePicture} alt="Avatar" />
            ) : (
              <span>{getInitials(author?.firstName + ' ' + author?.lastName)}</span>
            )}
          </div>
          <div className={styles.authorDetails}>
            <h4 className={styles.authorName}>
              {author?.firstName} {author?.lastName}
            </h4>
            <p className={styles.postDate}>{formatDateTime(createdAt)}</p>
          </div>
        </div>

        {title && (
          <h3 className={styles.postTitle}>{title}</h3>
        )}
      </div>

      <div className={styles.postContent}>
        <p className={styles.content}>{content}</p>
      </div>

      <div className={styles.postActions}>
        <Button
          variant="ghost"
          size="small"
          onClick={() => setShowReplyForm(!showReplyForm)}
        >
          💬 Responder
        </Button>

        {replies.length > 0 && (
          <Button
            variant="ghost"
            size="small"
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies ? 'Ocultar' : 'Ver'} {replies.length} respuesta{replies.length !== 1 ? 's' : ''}
          </Button>
        )}
      </div>

      {showReplyForm && (
        <div className={styles.replyForm}>
          <PostForm
            isReply={true}
            onSubmit={handleReply}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {showReplies && replies.length > 0 && (
        <div className={styles.replies}>
          {replies.map(reply => (
            <div key={reply.id} className={styles.reply}>
              <div className={styles.replyHeader}>
                <div className={styles.replyAuthor}>
                  <div className={styles.replyAvatar}>
                    {reply.author?.profilePicture ? (
                      <img src={reply.author.profilePicture} alt="Avatar" />
                    ) : (
                      <span>{getInitials(reply.author?.firstName + ' ' + reply.author?.lastName)}</span>
                    )}
                  </div>
                  <div className={styles.replyDetails}>
                    <span className={styles.replyAuthorName}>
                      {reply.author?.firstName} {reply.author?.lastName}
                    </span>
                    <span className={styles.replyDate}>{formatDateTime(reply.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className={styles.replyContent}>
                <p>{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default PostCard;
