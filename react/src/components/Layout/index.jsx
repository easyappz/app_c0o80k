import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './styles.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="layout" data-easytag="id3-react/src/components/Layout/index.jsx">
      <header className="layout-header">
        <div className="header-container">
          <div className="header-left">
            <Link to="/" className="logo">
              <span className="logo-icon">🌟</span>
              <span className="logo-text">SocialHub</span>
            </Link>
          </div>

          <div className="header-center">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">
                🔍
              </button>
            </form>
          </div>

          <nav className="header-nav desktop-nav">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              <span className="nav-icon">📰</span>
              <span>Лента</span>
            </Link>
            <Link to="/friends" className={`nav-link ${isActive('/friends') ? 'active' : ''}`}>
              <span className="nav-icon">👥</span>
              <span>Друзья</span>
            </Link>
            <Link to="/messages" className={`nav-link ${isActive('/messages') ? 'active' : ''}`}>
              <span className="nav-icon">💬</span>
              <span>Сообщения</span>
            </Link>
            <Link to={`/profile/${user?.id}`} className={`nav-link ${location.pathname.startsWith('/profile') ? 'active' : ''}`}>
              <span className="nav-icon">👤</span>
              <span>Профиль</span>
            </Link>
            <Link to="/settings" className={`nav-link ${isActive('/settings') ? 'active' : ''}`}>
              <span className="nav-icon">⚙️</span>
              <span>Настройки</span>
            </Link>
          </nav>

          <div className="header-right">
            <div className="user-menu">
              <button
                className="user-button"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="user-avatar">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.username} />
                  ) : (
                    <span className="avatar-placeholder">
                      {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                    </span>
                  )}
                </div>
                <span className="dropdown-arrow">▼</span>
              </button>

              {showDropdown && (
                <div className="dropdown-menu">
                  <Link
                    to={`/profile/${user?.id}`}
                    className="dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    <span className="dropdown-icon">👤</span>
                    Мой профиль
                  </Link>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <span className="dropdown-icon">🚪</span>
                    Выход
                  </button>
                </div>
              )}
            </div>

            <button
              className="mobile-menu-btn"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <span className="burger-icon">
                {showMobileMenu ? '✕' : '☰'}
              </span>
            </button>
          </div>
        </div>

        {showMobileMenu && (
          <nav className="mobile-nav">
            <Link
              to="/"
              className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={() => setShowMobileMenu(false)}
            >
              <span className="nav-icon">📰</span>
              <span>Лента</span>
            </Link>
            <Link
              to="/friends"
              className={`mobile-nav-link ${isActive('/friends') ? 'active' : ''}`}
              onClick={() => setShowMobileMenu(false)}
            >
              <span className="nav-icon">👥</span>
              <span>Друзья</span>
            </Link>
            <Link
              to="/messages"
              className={`mobile-nav-link ${isActive('/messages') ? 'active' : ''}`}
              onClick={() => setShowMobileMenu(false)}
            >
              <span className="nav-icon">💬</span>
              <span>Сообщения</span>
            </Link>
            <Link
              to={`/profile/${user?.id}`}
              className={`mobile-nav-link ${location.pathname.startsWith('/profile') ? 'active' : ''}`}
              onClick={() => setShowMobileMenu(false)}
            >
              <span className="nav-icon">👤</span>
              <span>Профиль</span>
            </Link>
            <Link
              to="/settings"
              className={`mobile-nav-link ${isActive('/settings') ? 'active' : ''}`}
              onClick={() => setShowMobileMenu(false)}
            >
              <span className="nav-icon">⚙️</span>
              <span>Настройки</span>
            </Link>
          </nav>
        )}
      </header>

      <main className="layout-main">
        {children}
      </main>
    </div>
  );
};

export default Layout;
