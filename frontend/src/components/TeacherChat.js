import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { sendMessage, getTeacherChat, closeChat } from '../services/api';
import ChatMessage from './ChatMessage';

const socket = io(process.env.REACT_APP_API_URL);

const TeacherChat = ({ schoolName, teacherName, setSchoolName, setTeacherName }) => {
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  // useEffect(() => {
  //   if (!schoolName || !teacherName) {
  //     setChat(null);
  //     return;
  //   }

  //   const fetchChat = async () => {
  //     try {
  //       const response = await getTeacherChat(schoolName, teacherName);
  //       setChat(response.data);
  //       if (response.data?._id) {
  //         socket.emit('joinChat', response.data._id);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching chat:', error);
  //       setChat(null);
  //     }
  //   };

  //   fetchChat();

  //   socket.on('newMessage', (updatedChat) => {
  //     if (updatedChat.schoolName === schoolName && updatedChat.teacherName === teacherName) {
  //       setChat(updatedChat);
  //     }
  //   });

  //   socket.on('chatClosed', (chatId) => {
  //     if (chat?._id === chatId) {
  //       setChat(null);
  //       setSchoolName('');
  //       setTeacherName('');
  //     }
  //   });

  //   return () => {
  //     socket.off('newMessage');
  //     socket.off('chatClosed');
  //     if (chat?._id) {
  //       socket.emit('leaveChat', chat._id);
  //     }
  //   };
  // }, [schoolName, teacherName, setSchoolName, setTeacherName]);

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
      setChat(null);
    }
  };

  fetchChat();

  const handleNewMessage = (updatedChat) => {
    if (updatedChat._id === currentChatId) {
      setChat(updatedChat);
    }
  };

  socket.on('newMessage', handleNewMessage);

  socket.on('chatClosed', (chatId) => {
    if (currentChatId === chatId) {
      setChat(null);
      setSchoolName('');
      setTeacherName('');
    }
  });

  return () => {
    socket.off('newMessage', handleNewMessage);
    socket.off('chatClosed');
    if (currentChatId) {
      socket.emit('leaveChat', currentChatId);
    }
  };
}, [schoolName, teacherName, setSchoolName, setTeacherName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      const response = await sendMessage({ schoolName, teacherName, message });
      setChat(response.data.chat);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleCloseChat = async () => {
    if (!chat?._id) return;

    try {
      await closeChat(chat._id);
      setChat(null);
      setSchoolName('');
      setTeacherName('');
    } catch (error) {
      console.error('Error closing chat:', error);
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
            />
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Teacher Name"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
            />
            <button
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => schoolName.trim() && teacherName.trim() && setSchoolName(schoolName)}
            >
              Start Chat
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
          chat.messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
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
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleSendMessage}
        >
          Send
        </button>
        {/* <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          onClick={handleCloseChat}
        >
          Close Chat
        </button> */}
      </div>
    </div>
  );
};

export default TeacherChat;


