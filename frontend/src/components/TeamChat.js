import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { replyToChat } from '../services/api';
import ChatMessage from './ChatMessage';

const socket = io(process.env.REACT_APP_API_URL);

const TeamChat = ({ chat }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  // useEffect(() => {
  //   if (!chat) {
  //     setMessages([]);
  //     return;
  //   }

  //   setMessages(chat.messages || []);
  //   socket.emit('joinChat', chat._id);

  //   socket.on('newMessage', (updatedChat) => {
  //     if (updatedChat._id === chat._id) {
  //       setMessages(updatedChat.messages || []);
  //     }
  //   });

  //   socket.on('chatClosed', (chatId) => {
  //     if (chatId === chat._id) {
  //       setMessages([]);
  //     }
  //   });

  //   return () => {
  //     socket.off('newMessage');
  //     socket.off('chatClosed');
  //     socket.emit('leaveChat', chat._id);
  //   };
  // }, [chat]);

  useEffect(() => {
  if (!chat) {
    setMessages([]);
    return;
  }

  setMessages(chat.messages || []);
  socket.emit('joinChat', chat._id);

  const handleNewMessage = (updatedChat) => {
    if (updatedChat._id === chat._id) {
      setMessages(updatedChat.messages || []);
    }
  };

  socket.on('newMessage', handleNewMessage);

  socket.on('chatClosed', (chatId) => {
    if (chatId === chat._id) {
      setMessages([]);
    }
  });

  return () => {
    socket.off('newMessage', handleNewMessage);
    socket.off('chatClosed');
    socket.emit('leaveChat', chat._id);
  };
}, [chat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendReply = async () => {
    if (!message.trim() || !chat?.isActive) return;

    try {
      const response = await replyToChat(chat._id, message);
      setMessages(response.data.chat.messages || []);
      setMessage('');
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  if (!chat) {
    return (
      <div className="p-4 bg-gray-200 rounded-lg h-[calc(100vh-100px)] flex items-center justify-center">
        <p className="text-gray-500">Select a teacher to view their chat</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">
        {chat.teacherName} - {chat.schoolName} {chat.isActive ? '' : '(Closed)'}
      </h3>
      <div className="bg-white p-4 rounded-lg shadow h-[calc(100vh-200px)] overflow-y-auto mb-4">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))
        ) : (
          <p className="text-gray-500 text-center">No messages yet</p>
        )}
        <div ref={messagesEndRef} />
      </div>
      {chat.isActive ? (
        <div className="flex gap-2">
          <textarea
            className="flex-1 p-2 border rounded"
            placeholder="Type your reply..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={handleSendReply}
          >
            Send
          </button>
        </div>
      ) : (
        <p className="text-red-500">This chat is closed</p>
      )}
    </div>
  );
};

export default TeamChat;
