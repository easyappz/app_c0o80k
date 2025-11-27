import axios from './axios';

export const getUser = async (userId) => {
  const response = await axios.get(`/api/users/${userId}/`);
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await axios.get(`/api/users/${userId}/`);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await axios.put(`/api/users/${userId}/`, userData);
  return response.data;
};

export const searchUsers = async (searchQuery) => {
  const response = await axios.get('/api/users/', {
    params: { search: searchQuery }
  });
  return response.data;
};
