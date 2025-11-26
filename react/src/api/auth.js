import instance from './axios';

export const register = async (userData) => {
  const response = await instance.post('/api/auth/register/', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await instance.post('/api/auth/login/', credentials);
  return response.data;
};

export const logout = async () => {
  const response = await instance.post('/api/auth/logout/');
  return response.data;
};

export const getMe = async () => {
  const response = await instance.get('/api/auth/me/');
  return response.data;
};
