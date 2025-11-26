import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { searchUsers } from '../../api/users';
import Layout from '../../components/Layout';
import './styles.css';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      return;
    }

    try {
      setLoading(true);
      setSearched(true);
      const results = await searchUsers(searchQuery.trim());
      setUsers(results);
    } catch (err) {
      console.error('Error searching users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    if (!e.target.value.trim()) {
      setUsers([]);
      setSearched(false);
    }
  };

  return (
    <Layout>
      <div className="search-page" data-easytag="id8-react/src/pages/Search/index.jsx">
        <div className="search-container">
          <h1 className="search-title">Поиск пользователей</h1>
          
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Введите имя, фамилию или username..."
                value={searchQuery}
                onChange={handleInputChange}
                className="search-input"
                disabled={loading}
              />
              <button
                type="submit"
                className="search-button"
                disabled={loading || !searchQuery.trim()}
              >
                {loading ? '🔄' : '🔍'}
              </button>
            </div>
          </form>
          
          {loading && (
            <div className="search-loading">
              <div className="loading-spinner">Поиск...</div>
            </div>
          )}
          
          {!loading && searched && users.length === 0 && (
            <div className="search-no-results">
              <p>Пользователи не найдены</p>
              <p className="no-results-hint">Попробуйте изменить запрос</p>
            </div>
          )}
          
          {!loading && users.length > 0 && (
            <div className="search-results">
              <div className="results-count">
                Найдено: {users.length} {users.length === 1 ? 'пользователь' : 'пользователей'}
              </div>
              <div className="users-grid">
                {users.map((user) => (
                  <div key={user.id} className="user-card">
                    <Link to={`/profile/${user.id}`} className="user-card-link">
                      <div className="user-card-avatar">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.username} />
                        ) : (
                          <span className="avatar-placeholder-search">
                            {user.first_name?.[0] || user.username?.[0] || 'U'}
                          </span>
                        )}
                      </div>
                      <div className="user-card-info">
                        <div className="user-card-name">
                          {user.first_name && user.last_name
                            ? `${user.first_name} ${user.last_name}`
                            : user.username}
                        </div>
                        <div className="user-card-username">@{user.username}</div>
                        {user.bio && (
                          <div className="user-card-bio">{user.bio}</div>
                        )}
                      </div>
                    </Link>
                    <Link to={`/profile/${user.id}`} className="user-card-button">
                      Перейти в профиль
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!loading && !searched && (
            <div className="search-placeholder">
              <div className="placeholder-icon">🔍</div>
              <p className="placeholder-text">Начните поиск, чтобы найти друзей</p>
              <p className="placeholder-hint">Введите имя, фамилию или username</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Search;
