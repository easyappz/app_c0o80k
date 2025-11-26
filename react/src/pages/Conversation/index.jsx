import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMessages, sendMessage } from '../../api/messages';
import { getUserById } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import './styles.css';

const Conversation = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [recipient, setRecipient] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversation();
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = async () => {
    try {
      setLoading(true);
      setError(null);
      const [messagesData, userData] = await Promise.all([
        getMessages(userId),
        getUserById(userId)
      ]);
      setMessages(messagesData);
      setRecipient(userData);
    } catch (err) {
      setError('Не удалось загрузить диалог');
      console.error('Error loading conversation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const sentMessage = await sendMessage(parseInt(userId), newMessage.trim());
      setMessages([...messages, sentMessage]);
      setNewMessage('');
    } catch (err) {
      setError('Не удалось отправить сообщение');
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="conversation-page" data-easytag="id12-react/src/pages/Conversation/index.jsx">
        <div className="container">
          <div className="conversation-loading">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="conversation-page" data-easytag="id12-react/src/pages/Conversation/index.jsx">
      <div className="container">
        <div className="conversation-header">
          <button className="btn-back" onClick={() => navigate('/messages')}>←</button>
          <div className="conversation-user">
            <div className="user-avatar">
              {recipient?.avatar_url ? (
                <img src={recipient.avatar_url} alt={recipient.username} />
              ) : (
                <div className="avatar-placeholder">
                  {recipient?.first_name?.[0] || recipient?.username[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="user-info">
              <h2>
                {recipient?.first_name && recipient?.last_name
                  ? `${recipient.first_name} ${recipient.last_name}`
                  : recipient?.username}
              </h2>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="no-messages">
              <p>Начните диалог!</p>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((message) => {
                const isOwn = message.sender.id === currentUser?.id;
                return (
                  <div
                    key={message.id}
                    className={`message ${isOwn ? 'message-own' : 'message-other'}`}
                  >
                    <div className="message-bubble">
                      <p className="message-content">{message.content}</p>
                      <span className="message-time">{formatTime(message.created_at)}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <form className="message-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="message-input"
            placeholder="Напишите сообщение..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending}
          />
          <button
            type="submit"
            className="btn-send"
            disabled={!newMessage.trim() || sending}
          >
            {sending ? '...' : '→'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Conversation;
