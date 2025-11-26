import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateUser } from '../../api/users';
import Layout from '../../components/Layout';
import './styles.css';

const Settings = () => {
  const navigate = useNavigate();
  const { user, checkAuth } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    avatar_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
        avatar_url: user.avatar_url || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.first_name.trim()) {
      setError('Имя обязательно для заполнения');
      return;
    }
    
    if (!formData.last_name.trim()) {
      setError('Фамилия обязательна для заполнения');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage('');
      
      const updateData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        bio: formData.bio.trim() || null,
        avatar_url: formData.avatar_url.trim() || null
      };
      
      await updateUser(user.id, updateData);
      await checkAuth();
      
      setSuccessMessage('Профиль успешно обновлен!');
      
      setTimeout(() => {
        navigate(`/profile/${user.id}`);
      }, 1500);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.error || 'Не удалось обновить профиль');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="loading-spinner">Загрузка...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="settings-page" data-easytag="id7-react/src/pages/Settings/index.jsx">
        <div className="settings-container">
          <h1 className="settings-title">Настройки профиля</h1>
          
          <div className="settings-content">
            <div className="settings-form-section">
              <form onSubmit={handleSubmit} className="settings-form">
                {error && (
                  <div className="error-message">{error}</div>
                )}
                
                {successMessage && (
                  <div className="success-message">{successMessage}</div>
                )}
                
                <div className="form-group">
                  <label htmlFor="first_name">Имя *</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    disabled={loading}
                    maxLength={150}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="last_name">Фамилия *</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    disabled={loading}
                    maxLength={150}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="bio">О себе</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={loading}
                    rows={4}
                    placeholder="Расскажите немного о себе..."
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="avatar_url">URL аватара</label>
                  <input
                    type="url"
                    id="avatar_url"
                    name="avatar_url"
                    value={formData.avatar_url}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
              </form>
            </div>
            
            <div className="settings-preview-section">
              <h2 className="preview-title">Предпросмотр</h2>
              <div className="preview-card">
                <div className="preview-avatar">
                  {formData.avatar_url ? (
                    <img
                      src={formData.avatar_url}
                      alt="Preview"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <span
                    className="avatar-placeholder-preview"
                    style={{ display: formData.avatar_url ? 'none' : 'flex' }}
                  >
                    {formData.first_name?.[0] || user.username?.[0] || 'U'}
                  </span>
                </div>
                <div className="preview-info">
                  <div className="preview-name">
                    {formData.first_name || formData.last_name
                      ? `${formData.first_name} ${formData.last_name}`.trim()
                      : user.username}
                  </div>
                  <div className="preview-username">@{user.username}</div>
                  {formData.bio && (
                    <div className="preview-bio">{formData.bio}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
