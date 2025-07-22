import { useState, useEffect } from 'react';
import { getAllChats } from '../services/api';
import ChatList from '../components/ChatList';

const TeamDashboard = () => {
  const [chats, setChats] = useState([]);
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
  }, []);

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Team Dashboard</h1>
      <ChatList chats={chats} />
    </div>
  );
};

export default TeamDashboard;