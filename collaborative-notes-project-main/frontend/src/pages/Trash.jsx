import { useState, useEffect } from 'react';
import { Trash2, RotateCcw, AlertTriangle, Clock, X } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import TopNav from '../components/layout/TopNav';
import api from '../api/api';

export default function Trash() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [trashedNotes, setTrashedNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => { fetchTrash(); }, []);

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notes/trash');
      setTrashedNotes(res.data || []);
    } catch (err) {
      console.error('Failed to load trash', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    try {
      await api.put(`/notes/${id}/restore`);
      setTrashedNotes(prev => prev.filter(n => n.id !== id));
    } catch { alert('Failed to restore note.'); }
  };

  const handlePermanentDelete = async (id) => {
    try {
      await api.delete(`/notes/${id}/permanent`);
      setTrashedNotes(prev => prev.filter(n => n.id !== id));
      setConfirmDeleteId(null);
    } catch { alert('Failed to permanently delete note.'); }
  };

  const getDaysRemaining = (deletedAt) => {
    if (!deletedAt) return 7;
    const deleted = new Date(deletedAt);
    const expiry = new Date(deleted.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const remaining = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, remaining);
  };

  const getDaysColor = (days) => {
    if (days <= 1) return 'text-red-500 bg-red-50 dark:bg-red-900/20';
    if (days <= 3) return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
    return 'text-slate-500 bg-slate-100 dark:bg-slate-800';
  };

  const filteredNotes = trashedNotes.filter(n => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q);
  });

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav setSidebarOpen={setSidebarOpen} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <main className="flex-1 overflow-auto px-6 sm:px-10 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Trash</h1>
              </div>
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Notes in trash are <strong>automatically deleted after 7 days</strong>. Restore notes you want to keep.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Trash is empty</h3>
                <p className="text-slate-500 text-sm">Deleted notes will appear here for 7 days before permanent removal.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotes.map(note => {
                  const daysLeft = getDaysRemaining(note.deletedAt);
                  const daysColor = getDaysColor(daysLeft);

                  return (
                    <div
                      key={note.id}
                      className="group flex items-start gap-4 p-5 bg-surface border border-border rounded-2xl hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                    >
                      {/* Note icon */}
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                        <Trash2 className="w-5 h-5 text-slate-400" />
                      </div>

                      {/* Note info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1 truncate">{note.title || 'Untitled Note'}</h3>
                        {note.content && (
                          <p className="text-sm text-slate-500 line-clamp-1 mb-2">{note.content.substring(0, 120)}</p>
                        )}
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${daysColor}`}>
                            <Clock className="w-3 h-3" />
                            {daysLeft === 0 ? 'Deleting soon' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
                          </span>
                          {note.deletedAt && (
                            <span className="text-xs text-slate-400">
                              Deleted {new Date(note.deletedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleRestore(note.id)}
                          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 rounded-lg transition-colors"
                          title="Restore note"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span className="hidden sm:inline">Restore</span>
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(note.id)}
                          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                          title="Permanently delete"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Confirm Permanent Delete Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Permanently Delete?</h3>
              </div>
              <button onClick={() => setConfirmDeleteId(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              This note will be <strong className="text-red-500">permanently deleted</strong> and cannot be recovered. Are you sure?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePermanentDelete(confirmDeleteId)}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
