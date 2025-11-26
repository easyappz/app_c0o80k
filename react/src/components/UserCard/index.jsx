import React from 'react';
import './styles.css';

const UserCard = ({ user, actions, showBio = false }) => {
  const getInitials = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user.username ? user.username[0].toUpperCase() : 'U';
  };

  const getFullName = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.username || 'Пользователь';
  };

  return (
    <div className="user-card" data-easytag="id10-react/src/components/UserCard/index.jsx">
      <div className="user-card-avatar">
        {user.avatar_url ? (
          <img src={user.avatar_url} alt={getFullName()} />
        ) : (
          <div className="user-card-avatar-placeholder">{getInitials()}</div>
        )}
      </div>
      <div className="user-card-info">
        <h3 className="user-card-name">{getFullName()}</h3>
        <p className="user-card-username">@{user.username}</p>
        {showBio && user.bio && <p className="user-card-bio">{user.bio}</p>}
      </div>
      {actions && <div className="user-card-actions">{actions}</div>}
    </div>
  );
};

export default UserCard;
