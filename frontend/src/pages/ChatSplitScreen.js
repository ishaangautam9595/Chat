import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import TeacherChat from '../components/TeacherChat';
import TeamChat from '../components/TeamChat';
import TeacherList from '../components/TeacherList';
import { getAllChats } from '../services/api';

const socket = io(process.env.REACT_APP_API_URL);

const ChatSplitScreen = () => {
  const [schoolName, setSchoolName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await getAllChats();
        setChats(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching chats:', error);
        setLoading(false);
      }
    };

    fetchChats();

    // Listen for new or updated chats
    socket.on('newChat', (updatedChat) => {
      setChats((prevChats) => {
        const updatedChats = prevChats.filter((chat) => chat._id !== updatedChat._id);
        return [updatedChat, ...updatedChats].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
      if (selectedChat?._id === updatedChat._id) {
        setSelectedChat(updatedChat);
      }
    });

    return () => {
      socket.off('newChat');
    };
  }, [selectedChat]);


  return (
    <div className="flex h-screen">
      <div className="w-1/2 p-4 border-r">
        <TeacherChat
          schoolName={schoolName}
          teacherName={teacherName}
          setSchoolName={setSchoolName}
          setTeacherName={setTeacherName}
        />
      </div>
      <div className="w-1/2 p-4 flex flex-col">
        <div className="flex-1">
          <TeacherList chats={chats} selectedChat={selectedChat} setSelectedChat={setSelectedChat} />
        </div>
        <div className="flex-1 mt-4">
          {loading ? (
            <div className="text-center p-4">Loading...</div>
          ) : (
            <TeamChat chat={selectedChat} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSplitScreen;