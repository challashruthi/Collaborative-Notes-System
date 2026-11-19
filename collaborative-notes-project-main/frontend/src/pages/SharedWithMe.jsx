import { useState, useEffect } from 'react';
import { Users, Clock, FileText, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import TopNav from '../components/layout/TopNav';
import api from '../api/api';

export default function SharedWithMe() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});
  const navigate = useNavigate();

  useEffect(() => { fetchShared(); }, []);

  const fetchShared = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notes/shared-grouped');
      const data = res.data || [];
      setGroups(data);
      // Auto-expand all groups
      const expanded = {};
      data.forEach(g => { expanded[g.sharerId] = true; });
      setExpandedGroups(expanded);
    } catch (err) {
      console.error('Failed to fetch shared notes', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleGroup = (sharerId) => {
    setExpandedGroups(prev => ({ ...prev, [sharerId]: !prev[sharerId] }));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  const AVATAR_COLORS = [
    'from-blue-500 to-blue-700',
    'from-violet-500 to-violet-700',
    'from-emerald-500 to-emerald-700',
    'from-rose-500 to-rose-700',
    'from-amber-500 to-amber-700',
    'from-cyan-500 to-cyan-700',
  ];

  const filteredGroups = groups.map(g => ({
    ...g,
    notes: (g.notes || []).filter(note => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return note.title?.toLowerCase().includes(q) || note.content?.toLowerCase().includes(q);
    })
  })).filter(g => g.notes.length > 0);

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav setSidebarOpen={setSidebarOpen} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <main className="flex-1 overflow-auto px-6 sm:px-10 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Shared with Me</h1>
              </div>
              <p className="text-slate-500 text-sm ml-13 pl-1">
                {loading ? 'Loading...' : `${filteredGroups.length} person${filteredGroups.length !== 1 ? 's' : ''} shared notes with you`}
              </p>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="bg-surface border border-border rounded-2xl overflow-hidden animate-pulse">
                    <div className="h-16 bg-slate-100 dark:bg-slate-800" />
                    <div className="p-4 space-y-3">
                      {[...Array(2)].map((_, j) => <div key={j} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl" />)}
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No shared notes yet</h3>
                <p className="text-slate-500 text-sm">When someone shares a note with you, it will appear here.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredGroups.map((group, idx) => (
                  <div key={group.sharerId} className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
                    {/* Person Header */}
                    <button
                      onClick={() => toggleGroup(group.sharerId)}
                      className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className={`w-10 h-10 bg-gradient-to-br ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                        {getInitials(group.sharerName)}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-foreground">{group.sharerName}</p>
                        <p className="text-xs text-slate-500">{group.sharerEmail} · {group.notes.length} note{group.notes.length !== 1 ? 's' : ''} shared</p>
                      </div>
                      {expandedGroups[group.sharerId]
                        ? <ChevronDown className="w-5 h-5 text-slate-400" />
                        : <ChevronRight className="w-5 h-5 text-slate-400" />
                      }
                    </button>

                    {/* Timeline of notes */}
                    {expandedGroups[group.sharerId] && (
                      <div className="border-t border-border px-5 py-4">
                        <div className="relative">
                          {/* Timeline line */}
                          <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary-400 to-transparent opacity-30" />

                          <div className="space-y-4">
                            {group.notes.map((note, noteIdx) => (
                              <div key={note.id} className="flex gap-4 items-start pl-10 relative">
                                {/* Timeline dot */}
                                <div className={`absolute left-2.5 mt-2 w-3 h-3 rounded-full border-2 border-primary-400 ${noteIdx === 0 ? 'bg-primary-500' : 'bg-surface'}`} />

                                {/* Note card */}
                                <div
                                  onClick={() => navigate(`/notes/${note.id}`)}
                                  className="flex-1 group/card flex items-start justify-between p-4 bg-background border border-border rounded-xl hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
                                >
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-foreground mb-1 group-hover/card:text-primary-600 transition-colors truncate">
                                      {note.title || 'Untitled Note'}
                                    </h4>
                                    {note.content && (
                                      <p className="text-sm text-slate-500 line-clamp-2 mb-2">
                                        {note.content.substring(0, 120)}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatDate(note.updatedAt)} at {formatTime(note.updatedAt)}
                                      </span>
                                    </div>
                                  </div>
                                  <ExternalLink className="w-4 h-4 text-slate-300 group-hover/card:text-primary-500 transition-colors shrink-0 ml-3 mt-0.5" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
