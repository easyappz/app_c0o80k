import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toggleLike } from '../../api/likes';
import { getComments, createComment, deleteComment } from '../../api/comments';
import { deletePost } from '../../api/posts';
import { useAuth } from '../../context/AuthContext';
import './styles.css';

const PostCard = ({ post, onPostUpdated, onPostDeleted }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const handleLike = async () => {
    try {
      const data = await toggleLike(post.id);
      setIsLiked(data.is_liked);
      setLikesCount(data.likes_count);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const loadComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }

    try {
      setLoadingComments(true);
      const data = await getComments(post.id);
      setComments(data);
      setShowComments(true);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const newComment = await createComment(post.id, commentText);
      setComments([...comments, newComment]);
      setCommentText('');
      if (onPostUpdated) {
        onPostUpdated();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Удалить комментарий?')) return;

    try {
      await deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
      if (onPostUpdated) {
        onPostUpdated();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Удалить пост?')) return;

    try {
      await deletePost(post.id);
      if (onPostDeleted) {
        onPostDeleted(post.id);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин. назад`;
    if (hours < 24) return `${hours} ч. назад`;
    if (days < 7) return `${days} д. назад`;
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className="post-card" data-easytag="id5-react/src/components/PostCard/index.jsx">
      <div className="post-header">
        <Link to={`/profile/${post.author.id}`} className="post-author">
          <div className="post-avatar">
            {post.author.avatar_url ? (
              <img src={post.author.avatar_url} alt={post.author.username} />
            ) : (
              <span className="avatar-placeholder">
                {post.author.first_name?.[0] || post.author.username?.[0] || 'U'}
              </span>
            )}
          </div>
          <div className="post-author-info">
            <div className="post-author-name">
              {post.author.first_name && post.author.last_name
                ? `${post.author.first_name} ${post.author.last_name}`
                : post.author.username}
            </div>
            <div className="post-date">{formatDate(post.created_at)}</div>
          </div>
        </Link>
        {user?.id === post.author.id && (
          <button className="post-delete-btn" onClick={handleDeletePost}>
            🗑️
          </button>
        )}
      </div>

      <div className="post-content">
        {post.content}
      </div>

      <div className="post-actions">
        <button
          className={`post-action-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          <span className="action-icon">{isLiked ? '❤️' : '🤍'}</span>
          <span className="action-text">{likesCount}</span>
        </button>

        <button
          className="post-action-btn"
          onClick={loadComments}
        >
          <span className="action-icon">💬</span>
          <span className="action-text">{post.comments_count}</span>
        </button>
      </div>

      {showComments && (
        <div className="post-comments">
          {loadingComments ? (
            <div className="comments-loading">Загрузка комментариев...</div>
          ) : (
            <>
              {comments.length > 0 && (
                <div className="comments-list">
                  {comments.map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <Link to={`/profile/${comment.author.id}`} className="comment-avatar">
                        {comment.author.avatar_url ? (
                          <img src={comment.author.avatar_url} alt={comment.author.username} />
                        ) : (
                          <span className="avatar-placeholder-small">
                            {comment.author.first_name?.[0] || comment.author.username?.[0] || 'U'}
                          </span>
                        )}
                      </Link>
                      <div className="comment-content">
                        <div className="comment-header">
                          <Link to={`/profile/${comment.author.id}`} className="comment-author">
                            {comment.author.first_name && comment.author.last_name
                              ? `${comment.author.first_name} ${comment.author.last_name}`
                              : comment.author.username}
                          </Link>
                          <span className="comment-date">{formatDate(comment.created_at)}</span>
                        </div>
                        <div className="comment-text">{comment.content}</div>
                      </div>
                      {user?.id === comment.author.id && (
                        <button
                          className="comment-delete-btn"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleAddComment} className="comment-form">
                <input
                  type="text"
                  placeholder="Написать комментарий..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={submittingComment}
                  className="comment-input"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="comment-submit-btn"
                >
                  ➤
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;
