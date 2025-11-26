import axios from './axios';

export const getFriends = async () => {
  const response = await axios.get('/api/friends/');
  return response.data;
};

export const sendFriendRequest = async (userId) => {
  const response = await axios.post(`/api/friends/send/${userId}/`);
  return response.data;
};

export const acceptFriendRequest = async (requestId) => {
  const response = await axios.post(`/api/friends/accept/${requestId}/`);
  return response.data;
};

export const rejectFriendRequest = async (requestId) => {
  const response = await axios.post(`/api/friends/reject/${requestId}/`);
  return response.data;
};

export const removeFriend = async (userId) => {
  const response = await axios.delete(`/api/friends/remove/${userId}/`);
  return response.data;
};

export const getIncomingRequests = async () => {
  const response = await axios.get('/api/friends/requests/');
  return response.data;
};

export const getSentRequests = async () => {
  const response = await axios.get('/api/friends/sent/');
  return response.data;
};
