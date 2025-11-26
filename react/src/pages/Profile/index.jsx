import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUser } from '../../api/users';
import { getUserPosts } from '../../api/posts';
import { sendFriendRequest, removeFriend } from '../../api/friends';
import PostCard from '../../components/PostCard';
import Layout from '../../components/Layout';
import './styles.css';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [friendsCount, setFriendsCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  const isOwnProfile = currentUser?.id === parseInt(id);

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await getUser(id);
      setUser(userData);
      
      const userPosts = await getUserPosts(id);
      setPosts(userPosts);
      
      setFriendsCount(0);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Не удалось загрузить профиль');
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      setActionLoading(true);
      await sendFriendRequest(id);
      await loadProfile();
    } catch (err) {
      console.error('Error sending friend request:', err);
      alert('Не удалось отправить заявку в друзья');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!window.confirm('Удалить из друзей?')) return;
    
    try {
      setActionLoading(true);
      await removeFriend(id);
      await loadProfile();
    } catch (err) {
      console.error('Error removing friend:', err);
      alert('Не удалось удалить из друзей');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(p => p.id !== postId));
  };

  const handlePostUpdated = () => {
    loadProfile();
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="loading-spinner">Загрузка профиля...</div>
        </div>
      </Layout>
    );
  }

  if (error || !user) {
    return (
      <Layout>
        <div className="error-container">
          <div className="error-message">{error || 'Пользователь не найден'}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="profile-page" data-easytag="id6-react/src/pages/Profile/index.jsx">
        <div className="profile-header">
          <div className="profile-avatar-large">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.username} />
            ) : (
              <span className="avatar-placeholder-large">
                {user.first_name?.[0] || user.username?.[0] || 'U'}
              </span>
            )}
          </div>
          
          <div className="profile-info">
            <h1 className="profile-name">
              {user.first_name && user.last_name
                ? `${user.first_name} ${user.last_name}`
                : user.username}
            </h1>
            <div className="profile-username">@{user.username}</div>
            {user.bio && <div className="profile-bio">{user.bio}</div>}
            
            <div className="profile-stats">
              <div className="profile-stat">
                <span className="stat-value">{friendsCount}</span>
                <span className="stat-label">друзей</span>
              </div>
              <div className="profile-stat">
                <span className="stat-value">{posts.length}</span>
                <span className="stat-label">постов</span>
              </div>
            </div>
            
            <div className="profile-actions">
              {isOwnProfile ? (
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/settings')}
                >
                  Редактировать профиль
                </button>
              ) : (
                <>
                  {user.is_friend ? (
                    <>
                      <button
                        className="btn btn-secondary"
                        onClick={handleRemoveFriend}
                        disabled={actionLoading}
                      >
                        Удалить из друзей
                      </button>
                      <Link to={`/messages/${user.id}`} className="btn btn-primary">
                        Написать сообщение
                      </Link>
                    </>
                  ) : user.friend_request_status === 'pending_sent' ? (
                    <button className="btn btn-secondary" disabled>
                      Заявка отправлена
                    </button>
                  ) : user.friend_request_status === 'pending_received' ? (
                    <Link to="/friends" className="btn btn-primary">
                      Ответить на заявку
                    </Link>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={handleSendFriendRequest}
                      disabled={actionLoading}
                    >
                      Добавить в друзья
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="profile-posts">
          <h2 className="profile-posts-title">Посты</h2>
          {posts.length === 0 ? (
            <div className="no-posts">Нет постов</div>
          ) : (
            <div className="posts-list">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostDeleted={handlePostDeleted}
                  onPostUpdated={handlePostUpdated}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
