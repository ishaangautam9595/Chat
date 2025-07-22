import { useState } from 'react';
import TeacherChat from '../components/TeacherChat';

const TeacherDashboard = () => {
  const [schoolName, setSchoolName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (schoolName.trim() && teacherName.trim()) {
      setIsFormSubmitted(true);
    }
  };

  if (!isFormSubmitted) {
    return (
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Teacher Chat</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Enter Your Details</h2>
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
              onClick={handleSubmit}
            >
              Start Chat
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <TeacherChat schoolName={schoolName} teacherName={teacherName} />;
};

export default TeacherDashboard;