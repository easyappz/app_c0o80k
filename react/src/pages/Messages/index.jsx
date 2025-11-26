import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConversations } from '../../api/messages';
import './styles.css';

const Messages = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConversations();
      setConversations(data);
    } catch (err) {
      setError('Не удалось загрузить диалоги');
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = (userId) => {
    navigate(`/messages/${userId}`);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} мин назад`;
    }
    if (hours < 24) {
      return `${hours} ч назад`;
    }
    const days = Math.floor(hours / 24);
    if (days < 7) {
      return `${days} д назад`;
    }
    return date.toLocaleDateString('ru-RU');
  };

  const truncateMessage = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="messages-page" data-easytag="id11-react/src/pages/Messages/index.jsx">
        <div className="container">
          <div className="messages-loading">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-page" data-easytag="id11-react/src/pages/Messages/index.jsx">
      <div className="container">
        <div className="messages-header">
          <h1>Сообщения</h1>
          <button className="btn-back" onClick={() => navigate('/')}>← Назад</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {!loading && conversations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <h2>У вас пока нет сообщений</h2>
            <p>Начните общение с друзьями!</p>
          </div>
        ) : (
          <div className="conversations-list">
            {conversations.map((conversation) => (
              <div
                key={conversation.user.id}
                className="conversation-item"
                onClick={() => handleConversationClick(conversation.user.id)}
              >
                <div className="conversation-avatar">
                  {conversation.user.avatar_url ? (
                    <img src={conversation.user.avatar_url} alt={conversation.user.username} />
                  ) : (
                    <div className="avatar-placeholder">
                      {conversation.user.first_name?.[0] || conversation.user.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="conversation-content">
                  <div className="conversation-header">
                    <h3 className="conversation-name">
                      {conversation.user.first_name && conversation.user.last_name
                        ? `${conversation.user.first_name} ${conversation.user.last_name}`
                        : conversation.user.username}
                    </h3>
                    {conversation.last_message && (
                      <span className="conversation-time">
                        {formatTime(conversation.last_message.created_at)}
                      </span>
                    )}
                  </div>
                  <div className="conversation-footer">
                    <p className="conversation-message">
                      {conversation.last_message
                        ? truncateMessage(conversation.last_message.content)
                        : 'Нет сообщений'}
                    </p>
                    {conversation.unread_count > 0 && (
                      <span className="unread-badge">{conversation.unread_count}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
