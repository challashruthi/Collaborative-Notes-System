import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Clock, Edit3, Sparkles, TrendingUp, FileEdit } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import TopNav from '../components/layout/TopNav';
import NoteCard from '../components/NoteCard';
import api from '../api/api';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentNotes, setRecentNotes] = useState([]);
  const [draftNotes, setDraftNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = (() => { try { return JSON.parse(localStorage.getItem('user')) || {}; } catch { return {}; } })();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recentRes, draftRes] = await Promise.all([
        api.get('/notes/recent').catch(() => ({ data: [] })),
        api.get('/notes/drafts').catch(() => ({ data: [] })),
      ]);
      setRecentNotes(recentRes.data || []);
      setDraftNotes(draftRes.data || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    try {
      const res = await api.post('/notes', { title: 'Untitled Note', content: '' });
      navigate(`/notes/${res.data.id}`);
    } catch {
      alert('Could not create note. Are you logged in?');
    }
  };

  const handleCreateDraft = async () => {
    try {
      const res = await api.post('/notes', { title: 'New Draft', content: '', isDraft: true });
      navigate(`/notes/${res.data.id}`);
    } catch {
      alert('Could not create draft.');
    }
  };

  const handleFavoriteToggle = (id) => {
    setRecentNotes(prev => prev.map(n => n.id === id ? { ...n, isFavorite: !n.isFavorite } : n));
    setDraftNotes(prev => prev.map(n => n.id === id ? { ...n, isFavorite: !n.isFavorite } : n));
  };

  const toNoteCard = (note) => ({
    id: note.id,
    title: note.title,
    preview: note.content ? note.content.substring(0, 100) : 'Empty note',
    updatedAt: new Date(note.updatedAt).toLocaleDateString(),
    collaborators: 1,
    isFavorite: note.isFavorite,
    isDraft: note.isDraft,
  });

  const filteredRecent = recentNotes.filter(n => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (n.title?.toLowerCase().includes(q)) || (n.content?.toLowerCase().includes(q));
  });

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav
          setSidebarOpen={setSidebarOpen}
          onCreateNote={handleCreateNote}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <main className="flex-1 overflow-auto">
          {/* Hero greeting banner */}
          <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-violet-700 px-6 py-8 sm:px-10">
            <div className="max-w-6xl mx-auto">
              <p className="text-primary-200 text-sm font-medium mb-1">{greeting},</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{user.name || 'Welcome back!'} ✨</h1>
              <p className="text-primary-200 text-sm">You have {recentNotes.length} recent notes and {draftNotes.length} draft{draftNotes.length !== 1 ? 's' : ''}.</p>
            </div>
          </div>

          <div className="px-6 sm:px-10 py-8 max-w-6xl mx-auto w-full space-y-10">

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={handleCreateNote}
                className="group flex items-center gap-4 p-5 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl text-white hover:shadow-xl hover:shadow-primary-500/25 hover:scale-[1.02] transition-all duration-300"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <Plus className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-base">Create New Note</p>
                  <p className="text-primary-200 text-xs mt-0.5">Start a blank note</p>
                </div>
              </button>

              <button
                onClick={handleCreateDraft}
                className="group flex items-center gap-4 p-5 bg-surface border border-border rounded-2xl hover:border-amber-300 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              >
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center shrink-0">
                  <Edit3 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-base text-foreground">New Draft</p>
                  <p className="text-slate-500 text-xs mt-0.5">Save privately as draft</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/my-notes')}
                className="group flex items-center gap-4 p-5 bg-surface border border-border rounded-2xl hover:border-violet-300 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              >
                <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-base text-foreground">Browse All Notes</p>
                  <p className="text-slate-500 text-xs mt-0.5">View folders & notes</p>
                </div>
              </button>
            </div>

            {/* Draft Notes */}
            {draftNotes.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileEdit className="w-5 h-5 text-amber-500" />
                    <h2 className="text-lg font-bold text-foreground">Draft Notes</h2>
                    <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full">{draftNotes.length}</span>
                  </div>
                  <button onClick={() => navigate('/my-notes')} className="text-sm text-primary-600 hover:underline font-medium">View all</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {draftNotes.slice(0, 4).map(note => (
                    <NoteCard
                      key={note.id}
                      note={toNoteCard(note)}
                      onFavoriteToggle={handleFavoriteToggle}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Recently Created Notes */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-500" />
                  <h2 className="text-lg font-bold text-foreground">Recently Created</h2>
                </div>
                <button onClick={() => navigate('/my-notes')} className="text-sm text-primary-600 hover:underline font-medium">View all</button>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : filteredRecent.length === 0 ? (
                <div className="text-center py-16 bg-surface border border-border border-dashed rounded-2xl">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-slate-500 font-semibold mb-1">No notes yet</h3>
                  <p className="text-slate-400 text-sm mb-4">Create your first note to get started</p>
                  <button
                    onClick={handleCreateNote}
                    className="px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    + Create Note
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredRecent.map(note => (
                    <NoteCard
                      key={note.id}
                      note={toNoteCard(note)}
                      onFavoriteToggle={handleFavoriteToggle}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
