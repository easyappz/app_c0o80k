import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getFriends,
  getIncomingRequests,
  getSentRequests,
  acceptRequest,
  rejectRequest,
  removeFriend
} from '../../api/friends';
import UserCard from '../../components/UserCard';
import './styles.css';

const Friends = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'friends') {
        const data = await getFriends();
        setFriends(data);
      } else if (activeTab === 'incoming') {
        const data = await getIncomingRequests();
        setIncomingRequests(data);
      } else if (activeTab === 'sent') {
        const data = await getSentRequests();
        setSentRequests(data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setActionLoading({ ...actionLoading, [requestId]: true });
    try {
      await acceptRequest(requestId);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Ошибка при принятии заявки');
    } finally {
      setActionLoading({ ...actionLoading, [requestId]: false });
    }
  };

  const handleRejectRequest = async (requestId) => {
    setActionLoading({ ...actionLoading, [requestId]: true });
    try {
      await rejectRequest(requestId);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Ошибка при отклонении заявки');
    } finally {
      setActionLoading({ ...actionLoading, [requestId]: false });
    }
  };

  const handleRemoveFriend = async (userId, userName) => {
    if (!window.confirm(`Вы уверены, что хотите удалить ${userName} из друзей?`)) {
      return;
    }
    setActionLoading({ ...actionLoading, [userId]: true });
    try {
      await removeFriend(userId);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Ошибка при удалении друга');
    } finally {
      setActionLoading({ ...actionLoading, [userId]: false });
    }
  };

  const handleGoToProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleGoToMessages = (userId) => {
    navigate(`/messages/${userId}`);
  };

  const renderFriends = () => {
    if (loading) {
      return <div className="friends-loading">Загрузка...</div>;
    }

    if (friends.length === 0) {
      return (
        <div className="friends-empty">
          <div className="friends-empty-icon">👥</div>
          <h3>У вас пока нет друзей</h3>
          <p>Используйте поиск, чтобы найти друзей и отправить им заявку</p>
          <button className="btn btn-primary" onClick={() => navigate('/search')}>
            Найти друзей
          </button>
        </div>
      );
    }

    return (
      <div className="friends-list">
        {friends.map((friend) => (
          <UserCard
            key={friend.id}
            user={friend}
            showBio={true}
            actions={
              <>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleGoToProfile(friend.id)}
                >
                  Профиль
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleGoToMessages(friend.id)}
                >
                  Написать
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleRemoveFriend(friend.id, `${friend.first_name} ${friend.last_name}`)}
                  disabled={actionLoading[friend.id]}
                >
                  {actionLoading[friend.id] ? 'Удаление...' : 'Удалить'}
                </button>
              </>
            }
          />
        ))}
      </div>
    );
  };

  const renderIncomingRequests = () => {
    if (loading) {
      return <div className="friends-loading">Загрузка...</div>;
    }

    if (incomingRequests.length === 0) {
      return (
        <div className="friends-empty">
          <div className="friends-empty-icon">📬</div>
          <h3>Нет входящих заявок</h3>
          <p>Когда кто-то отправит вам заявку в друзья, она появится здесь</p>
        </div>
      );
    }

    return (
      <div className="friends-list">
        {incomingRequests.map((request) => (
          <UserCard
            key={request.id}
            user={request.from_user}
            actions={
              <>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => handleAcceptRequest(request.id)}
                  disabled={actionLoading[request.id]}
                >
                  {actionLoading[request.id] ? 'Принятие...' : 'Принять'}
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleRejectRequest(request.id)}
                  disabled={actionLoading[request.id]}
                >
                  {actionLoading[request.id] ? 'Отклонение...' : 'Отклонить'}
                </button>
              </>
            }
          />
        ))}
      </div>
    );
  };

  const renderSentRequests = () => {
    if (loading) {
      return <div className="friends-loading">Загрузка...</div>;
    }

    if (sentRequests.length === 0) {
      return (
        <div className="friends-empty">
          <div className="friends-empty-icon">📤</div>
          <h3>Нет исходящих заявок</h3>
          <p>Отправьте заявку в друзья через поиск пользователей</p>
          <button className="btn btn-primary" onClick={() => navigate('/search')}>
            Найти друзей
          </button>
        </div>
      );
    }

    return (
      <div className="friends-list">
        {sentRequests.map((request) => (
          <UserCard
            key={request.id}
            user={request.to_user}
            actions={
              <span className="friends-status-badge">Ожидает ответа</span>
            }
          />
        ))}
      </div>
    );
  };

  return (
    <div className="friends-page" data-easytag="id9-react/src/pages/Friends/index.jsx">
      <div className="container">
        <h1>Друзья</h1>

        {error && <div className="error-message">{error}</div>}

        <div className="friends-tabs">
          <button
            className={`friends-tab ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            <span className="friends-tab-icon">👥</span>
            <span>Мои друзья</span>
            {friends.length > 0 && <span className="friends-tab-count">{friends.length}</span>}
          </button>
          <button
            className={`friends-tab ${activeTab === 'incoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('incoming')}
          >
            <span className="friends-tab-icon">📬</span>
            <span>Входящие заявки</span>
            {incomingRequests.length > 0 && <span className="friends-tab-count">{incomingRequests.length}</span>}
          </button>
          <button
            className={`friends-tab ${activeTab === 'sent' ? 'active' : ''}`}
            onClick={() => setActiveTab('sent')}
          >
            <span className="friends-tab-icon">📤</span>
            <span>Исходящие заявки</span>
            {sentRequests.length > 0 && <span className="friends-tab-count">{sentRequests.length}</span>}
          </button>
        </div>

        <div className="friends-content">
          {activeTab === 'friends' && renderFriends()}
          {activeTab === 'incoming' && renderIncomingRequests()}
          {activeTab === 'sent' && renderSentRequests()}
        </div>
      </div>
    </div>
  );
};

export default Friends;
