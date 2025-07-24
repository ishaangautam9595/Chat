import { useState, useEffect, useRef } from 'react';
import socket from '../services/socket';
import { sendMessage, getTeacherChat, closeChat } from '../services/api';
import ChatMessage from './ChatMessage';

const TeacherChat = ({ schoolName, teacherName, setSchoolName, setTeacherName }) => {
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!schoolName || !teacherName) {
      setChat(null);
      return;
    }

    let currentChatId = null;

    const fetchChat = async () => {
      try {
        const response = await getTeacherChat(schoolName, teacherName);
        setChat(response.data);
        if (response.data?._id) {
          currentChatId = response.data._id;
          socket.emit('joinChat', currentChatId);
        }
      } catch (error) {
        console.error('Error fetching chat:', error);
        setChat(null);
      }
    };

    fetchChat();

    const handleNewMessage = (updatedChat) => {
      console.log('New message received for chat:', updatedChat._id);
      if (updatedChat._id === currentChatId) {
        setChat(updatedChat);
      }
    };

    const handleChatClosed = (updatedChat) => {
      console.log('Chat closed received for chat:', updatedChat._id);
      if (updatedChat._id === currentChatId) {
        setChat(null);
        setSchoolName('');
        setTeacherName('');
      }
    };

    const handleSocketError = (error) => {
      console.error('Socket error:', error);
    };

    const handleReconnect = () => {
      if (currentChatId) socket.emit('joinChat', currentChatId);
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('chatClosed', handleChatClosed);
    socket.on('error', handleSocketError);
    socket.on('reconnect', handleReconnect);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('chatClosed', handleChatClosed);
      socket.off('error', handleSocketError);
      socket.off('reconnect', handleReconnect);
      if (currentChatId) {
        socket.emit('leaveChat', currentChatId);
      }
    };
  }, [schoolName, teacherName, setSchoolName, setTeacherName]);

  useEffect(() => {
    const element = messagesEndRef.current?.parentElement;
    if (element) {
      const isNearBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 100;
      if (isNearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [chat?.messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;

    try {
      setIsSending(true);
      const response = await sendMessage({ schoolName, teacherName, message });
      setChat(response.data.chat);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleCloseChat = async () => {
    if (!chat?._id || isSending) return;

    try {
      setIsSending(true);
      await closeChat(chat._id);
      setChat(null);
      setSchoolName('');
      setTeacherName('');
    } catch (error) {
      console.error('Error closing chat:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (!schoolName || !teacherName) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Teacher Chat</h2>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Enter Your Details</h3>
          <div className="space-y-4">
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="School Name"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              aria-label="School Name"
            />
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Teacher Name"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              aria-label="Teacher Name"
            />
            <button
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
              onClick={async () => {
                if (schoolName.trim() && teacherName.trim()) {
                  try {
                    const response = await getTeacherChat(schoolName, teacherName);
                    setChat(response.data);
                    if (response.data?._id) {
                      socket.emit('joinChat', response.data._id);
                    }
                  } catch (error) {
                    console.error('Error starting chat:', error);
                    setChat(null);
                  }
                }
              }}
              disabled={isSending}
            >
              {isSending ? 'Starting...' : 'Start Chat'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        Chat for {teacherName} at {schoolName}
      </h2>
      <div className="bg-white p-4 rounded-lg shadow h-[calc(100vh-200px)] overflow-y-auto mb-4">
        {chat?.messages?.length > 0 ? (
          chat.messages.map((msg) => (
            <ChatMessage key={msg._id || msg.timestamp || Math.random()} message={msg} />
          ))
        ) : (
          <p className="text-gray-500 text-center">No messages yet</p>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2">
        <textarea
          className="flex-1 p-2 border rounded"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          aria-label="Type your message"
          disabled={isSending}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          onClick={handleSendMessage}
          disabled={isSending}
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
        {/* <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-gray-400"
          onClick={handleCloseChat}
          disabled={isSending}
        >
          {isSending ? 'Closing...' : 'Close Chat'}
        </button> */}
      </div>
    </div>
  );
};

export default TeacherChat;