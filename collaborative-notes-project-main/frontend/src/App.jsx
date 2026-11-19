import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyNotes from './pages/MyNotes';
import SharedWithMe from './pages/SharedWithMe';
import Trash from './pages/Trash';
import Profile from './pages/Profile';
import NoteEditor from './pages/NoteEditor';
import VersionHistory from './pages/VersionHistory';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-notes" element={<MyNotes />} />
        <Route path="/shared-with-me" element={<SharedWithMe />} />
        <Route path="/trash" element={<Trash />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notes/:id" element={<NoteEditor />} />
        <Route path="/notes/:id/history" element={<VersionHistory />} />
        {/* Legacy redirects */}
        <Route path="/notes" element={<Navigate to="/my-notes" replace />} />
        <Route path="/shared" element={<Navigate to="/shared-with-me" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
