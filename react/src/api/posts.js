import axios from './axios';

export const getFeed = async () => {
  const response = await axios.get('/api/posts/');
  return response.data;
};

export const createPost = async (content) => {
  const response = await axios.post('/api/posts/', { content });
  return response.data;
};

export const deletePost = async (postId) => {
  const response = await axios.delete(`/api/posts/${postId}/`);
  return response.data;
};

export const getUserPosts = async (userId) => {
  const response = await axios.get(`/api/posts/user/${userId}/`);
  return response.data;
};
