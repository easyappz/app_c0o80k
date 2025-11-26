import axios from './axios';

export const getComments = async (postId) => {
  const response = await axios.get(`/api/posts/${postId}/comments/`);
  return response.data;
};

export const createComment = async (postId, content) => {
  const response = await axios.post(`/api/posts/${postId}/comments/`, { content });
  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await axios.delete(`/api/comments/${commentId}/`);
  return response.data;
};
