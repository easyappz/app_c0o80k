import React from 'react';
import { useParams } from 'react-router-dom';

const Profile = () => {
  const { id } = useParams();

  return (
    <div data-easytag="id1-react/src/pages/Profile.jsx" className="profile-page">
      <div className="container">
        <h1>Профиль пользователя {id}</h1>
        <p>Здесь будет отображаться профиль пользователя</p>
      </div>
    </div>
  );
};

export default Profile;
