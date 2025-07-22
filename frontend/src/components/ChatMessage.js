const ChatMessage = ({ message }) => {
  const isTeacher = message.sender === 'teacher';
  return (
    <div
      className={`mb-2 p-2 rounded-lg ${
        isTeacher ? 'bg-blue-100 ml-4' : 'bg-green-100 mr-4'
      }`}
    >
      <p className="font-semibold">
        {isTeacher ? 'Teacher' : 'Adaptmate'} ({new Date(message.timestamp).toLocaleTimeString()}):
      </p>
      <p>{message.content}</p>
    </div>
  );
};

export default ChatMessage;