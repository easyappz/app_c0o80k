import instance from './axios';

export const getConversations = async () => {
  const response = await instance.get('/api/messages/conversations/');
  return response.data;
};

export const getMessages = async (userId) => {
  const response = await instance.get(`/api/messages/conversation/${userId}/`);
  return response.data;
};

export const sendMessage = async (recipientId, content) => {
  const response = await instance.post('/api/messages/send/', {
    recipient_id: recipientId,
    content: content
  });
  return response.data;
};
