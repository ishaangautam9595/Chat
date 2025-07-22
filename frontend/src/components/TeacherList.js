const TeacherList = ({ chats, selectedChat, setSelectedChat }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow h-[calc(100vh-100px)] overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4">Teachers</h3>
      {chats.length === 0 ? (
        <p className="text-gray-500">No chats available</p>
      ) : (
        <ul className="space-y-2">
          {chats.map((chat) => (
            <li
              key={chat._id}
              className={`p-2 rounded cursor-pointer ${
                selectedChat?._id === chat._id ? 'bg-blue-100' : 'hover:bg-gray-100'
              }`}
              onClick={() => setSelectedChat(chat)}
            >
              {chat.teacherName} - {chat.schoolName} {chat.isActive ? '' : '(Closed)'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TeacherList;