import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatSplitScreen from './pages/ChatSplitScreen';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<ChatSplitScreen />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;