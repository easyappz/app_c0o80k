import React from 'react';
import { useParams } from 'react-router-dom';

const Conversation = () => {
  const { userId } = useParams();

  return (
    <div data-easytag="id1-react/src/pages/Conversation.jsx" className="conversation-page">
      <div className="container">
        <h1>Диалог с пользователем {userId}</h1>
        <p>Здесь будут сообщения</p>
      </div>
    </div>
  );
};

export default Conversation;
