import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Heart, Download, LogOut, Edit2, Check, X,
  FileText, Calendar, Shield, ChevronRight
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import TopNav from '../components/layout/TopNav';
import NoteCard from '../components/NoteCard';
import api from '../api/api';

export default function Profile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [noteCount, setNoteCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [activeTab, setActiveTab] = useState('favorites');
  const navigate = useNavigate();

  const user = (() => { try { return JSON.parse(localStorage.getItem('user')) || {}; } catch { return {}; } })();
  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  useEffect(() => {
    setEditName(user.name || '');
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [favRes, countRes] = await Promise.all([
        api.get('/notes/favorites').catch(() => ({ data: [] })),
        api.get('/notes/count').catch(() => ({ data: { total: 0 } })),
      ]);
      setFavorites(favRes.data || []);
      setNoteCount(countRes.data?.total || 0);
    } catch (err) {
      console.error('Profile fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!editName.trim()) return;
    try {
      await api.put('/users/me', { name: editName.trim() });
      const updatedUser = { ...user, name: editName.trim() };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditing(false);
    } catch { alert('Failed to update name.'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleFavoriteToggle = (id) => {
    setFavorites(prev => prev.filter(n => n.id !== id));
  };

  const toNoteCard = (note) => ({
    id: note.id,
    title: note.title,
    preview: note.content ? note.content.substring(0, 100) : 'Empty note',
    updatedAt: new Date(note.updatedAt).toLocaleDateString(),
    collaborators: 1,
    isFavorite: true,
  });

  const memberSince = user.id ? new Date().getFullYear() : 'N/A';

  const tabs = [
    { id: 'favorites', label: 'Favorites', icon: Heart, count: favorites.length },
    { id: 'downloads', label: 'Downloads', icon: Download, count: noteCount },
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-auto">
          {/* Profile Hero */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black px-6 sm:px-10 py-10">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                  {initials}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full border-2 border-slate-800 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left">
                {isEditing ? (
                  <div className="flex items-center gap-2 mb-1 justify-center sm:justify-start">
                    <input
                      autoFocus
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setIsEditing(false); }}
                      className="text-2xl font-bold bg-white/10 text-white border border-white/30 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-white/40"
                    />
                    <button onClick={handleSaveName} className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setIsEditing(false)} className="p-1.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-1 justify-center sm:justify-start">
                    <h1 className="text-2xl font-bold text-white">{user.name || 'User'}</h1>
                    <button onClick={() => setIsEditing(true)} className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 text-slate-400 text-sm justify-center sm:justify-start mb-4">
                  <Mail className="w-4 h-4" />
                  <span>{user.email || 'No email'}</span>
                </div>

                {/* Stats row */}
                <div className="flex gap-4 justify-center sm:justify-start">
                  <div className="text-center">
                    <p className="text-xl font-bold text-white">{noteCount}</p>
                    <p className="text-xs text-slate-400">Notes</p>
                  </div>
                  <div className="w-px bg-white/10" />
                  <div className="text-center">
                    <p className="text-xl font-bold text-white">{favorites.length}</p>
                    <p className="text-xs text-slate-400">Favorites</p>
                  </div>
                  <div className="w-px bg-white/10" />
                  <div className="text-center">
                    <p className="text-xl font-bold text-white">{memberSince}</p>
                    <p className="text-xs text-slate-400">Member Since</p>
                  </div>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded-xl text-sm font-medium transition-colors border border-red-500/30"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          </div>

          {/* Quick info cards */}
          <div className="px-6 sm:px-10 py-6 bg-surface border-b border-border">
            <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: User, label: 'Username', value: user.name || 'N/A', color: 'text-primary-500 bg-primary-50 dark:bg-primary-900/20' },
                { icon: Mail, label: 'Email', value: user.email || 'N/A', color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
                { icon: Heart, label: 'Favorites', value: favorites.length, color: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20' },
                { icon: FileText, label: 'Total Notes', value: noteCount, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-center gap-3 p-3 bg-background border border-border rounded-xl">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="w-4.5 h-4.5" size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="text-sm font-semibold text-foreground truncate">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 sm:px-10 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6 w-fit">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === tab.id
                          ? 'bg-white dark:bg-slate-700 text-foreground shadow-sm'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                      <span className={`px-1.5 py-0.5 text-xs rounded-full ${activeTab === tab.id ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Favorites Tab */}
              {activeTab === 'favorites' && (
                <div>
                  {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />)}
                    </div>
                  ) : favorites.length === 0 ? (
                    <div className="text-center py-14 bg-surface border border-dashed border-border rounded-2xl">
                      <Heart className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium mb-1">No favorites yet</p>
                      <p className="text-slate-400 text-sm">Click the ♥ icon on any note to add it to favorites</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {favorites.map(note => (
                        <NoteCard key={note.id} note={toNoteCard(note)} onFavoriteToggle={handleFavoriteToggle} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Downloads Tab */}
              {activeTab === 'downloads' && (
                <div className="bg-surface border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Download className="w-5 h-5 text-primary-500" />
                    <h3 className="font-bold text-foreground">Download Notes</h3>
                  </div>
                  <p className="text-sm text-slate-500 mb-4">
                    You have <strong className="text-foreground">{noteCount}</strong> note{noteCount !== 1 ? 's' : ''} total. Open any note and click the download button to save it as a .txt file.
                  </p>
                  <button
                    onClick={() => navigate('/my-notes')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    <FileText className="w-4 h-4" /> Browse My Notes
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
