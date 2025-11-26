import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import PostCard from '../../components/PostCard';
import { getFeed, createPost } from '../../api/posts';
import './styles.css';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postText, setPostText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFeed();
      setPosts(data);
    } catch (err) {
      console.error('Error loading feed:', err);
      setError('Не удалось загрузить ленту новостей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postText.trim()) return;

    try {
      setSubmitting(true);
      const newPost = await createPost(postText);
      setPosts([newPost, ...posts]);
      setPostText('');
    } catch (err) {
      console.error('Error creating post:', err);
      alert('Не удалось создать пост');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(p => p.id !== postId));
  };

  return (
    <Layout>
      <div className="feed-page" data-easytag="id4-react/src/pages/Feed/index.jsx">
        <div className="feed-container">
          <div className="feed-header">
            <h1 className="feed-title">Лента новостей</h1>
          </div>

          <div className="create-post-card">
            <h2 className="create-post-title">Что нового?</h2>
            <form onSubmit={handleCreatePost} className="create-post-form">
              <textarea
                placeholder="Поделитесь своими мыслями..."
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                disabled={submitting}
                className="create-post-textarea"
                rows="4"
              />
              <div className="create-post-actions">
                <button
                  type="submit"
                  disabled={submitting || !postText.trim()}
                  className="create-post-btn"
                >
                  {submitting ? 'Публикация...' : 'Опубликовать'}
                </button>
              </div>
            </form>
          </div>

          {loading ? (
            <div className="feed-loading">
              <div className="loading-spinner">Загрузка...</div>
            </div>
          ) : error ? (
            <div className="feed-error">
              <p>{error}</p>
              <button onClick={loadPosts} className="retry-btn">
                Попробовать снова
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="feed-empty">
              <div className="empty-icon">📭</div>
              <h3>Лента пуста</h3>
              <p>Добавьте друзей или создайте свой первый пост!</p>
            </div>
          ) : (
            <div className="posts-list">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostUpdated={loadPosts}
                  onPostDeleted={handlePostDeleted}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Feed;
