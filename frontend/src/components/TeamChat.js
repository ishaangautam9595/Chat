import { useState, useEffect, useRef } from 'react';
import socket from '../services/socket';
import { replyToChat } from '../services/api';
import ChatMessage from './ChatMessage';

const TeamChat = ({ chat }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.emit('joinTeam');

    const handleReconnect = () => {
      if (chat?._id) socket.emit('joinChat', chat._id);
    };

    socket.on('reconnect', handleReconnect);

    return () => {
      socket.emit('leaveTeam');
      socket.off('reconnect', handleReconnect);
    };
  }, []);

  useEffect(() => {
    if (!chat) {
      setMessages([]);
      return;
    }

    setMessages(chat.messages || []);
    socket.emit('joinChat', chat._id);

    const handleNewMessage = (updatedChat) => {
      console.log('New message received for chat:', updatedChat._id);
      if (updatedChat._id === chat._id) {
        setMessages(updatedChat.messages || []);
      }
    };

    const handleChatClosed = (updatedChat) => {
      console.log('Chat closed received for chat:', updatedChat._id);
      if (updatedChat._id === chat._id) {
        setMessages([]);
      }
    };

    const handleSocketError = (error) => {
      console.error('Socket error:', error);
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('chatClosed', handleChatClosed);
    socket.on('error', handleSocketError);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('chatClosed', handleChatClosed);
      socket.off('error', handleSocketError);
      socket.emit('leaveChat', chat._id);
    };
  }, [chat]);

  useEffect(() => {
    const element = messagesEndRef.current?.parentElement;
    if (element) {
      const isNearBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 100;
      if (isNearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  const handleSendReply = async () => {
    if (!message.trim() || !chat?.isActive || isSending) return;

    try {
      setIsSending(true);
      const response = await replyToChat(chat._id, message);
      setMessages(response.data.chat.messages || []);
      setMessage('');
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setIsSending(false);
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
          messages.map((msg) => (
            <ChatMessage key={msg._id || msg.timestamp || Math.random()} message={msg} />
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
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendReply();
              }
            }}
            aria-label="Type your reply message"
            disabled={isSending}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            onClick={handleSendReply}
            disabled={isSending}
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      ) : (
        <p className="text-red-500">This chat is closed</p>
      )}
    </div>
  );
};

export default TeamChat;