import axios from './axios';

export const toggleLike = async (postId) => {
  const response = await axios.post(`/api/posts/${postId}/like/`);
  return response.data;
};
