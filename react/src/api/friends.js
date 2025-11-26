import instance from './axios';

export const getFriends = async () => {
  const response = await instance.get('/api/friends/');
  return response.data;
};

export const getIncomingRequests = async () => {
  const response = await instance.get('/api/friends/requests/');
  return response.data;
};

export const getSentRequests = async () => {
  const response = await instance.get('/api/friends/sent/');
  return response.data;
};

export const sendFriendRequest = async (userId) => {
  const response = await instance.post(`/api/friends/send/${userId}/`);
  return response.data;
};

export const acceptRequest = async (requestId) => {
  const response = await instance.post(`/api/friends/accept/${requestId}/`);
  return response.data;
};

export const rejectRequest = async (requestId) => {
  const response = await instance.post(`/api/friends/reject/${requestId}/`);
  return response.data;
};

export const removeFriend = async (userId) => {
  const response = await instance.delete(`/api/friends/remove/${userId}/`);
  return response.data;
};
