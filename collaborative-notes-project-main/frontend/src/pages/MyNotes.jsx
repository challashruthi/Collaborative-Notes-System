import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, FolderPlus, FileText, Heart, Search, Grid, List, ArrowLeft, X } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import TopNav from '../components/layout/TopNav';
import NoteCard from '../components/NoteCard';
import FolderCard from '../components/FolderCard';
import api from '../api/api';

export default function MyNotes() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [folders, setFolders] = useState([]);
  const [notes, setNotes] = useState([]);
  const [noteCounts, setNoteCounts] = useState({});
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [activeFolder, setActiveFolder] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const folderParam = searchParams.get('folder');
    if (folderParam) {
      setActiveFolder(Number(folderParam));
    }
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, [activeFolder]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeFolder) {
        const res = await api.get(`/notes/folder/${activeFolder}`);
        setNotes(res.data || []);
      } else {
        const [foldersRes, unfiledRes] = await Promise.all([
          api.get('/folders'),
          api.get('/notes/unfiled'),
        ]);
        const folderList = foldersRes.data || [];
        setFolders(folderList);
        setNotes(unfiledRes.data || []);

        // Fetch note counts for each folder
        const counts = {};
        await Promise.all(
          folderList.map(async (folder) => {
            const res = await api.get(`/notes/folder/${folder.id}`);
            counts[folder.id] = (res.data || []).length;
          })
        );
        setNoteCounts(counts);
      }
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    try {
      const body = { title: 'Untitled Note', content: '' };
      if (activeFolder) body.folderId = activeFolder;
      const res = await api.post('/notes', body);
      navigate(`/notes/${res.data.id}`);
    } catch { alert('Could not create note. Are you logged in?'); }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const res = await api.post('/folders', { name: newFolderName.trim() });
      setFolders(prev => [res.data, ...prev]);
      setNoteCounts(prev => ({ ...prev, [res.data.id]: 0 }));
      setNewFolderName('');
      setShowCreateFolder(false);
    } catch { alert('Could not create folder.'); }
  };

  const handleDeleteFolder = async (id) => {
    if (!confirm('Delete this folder? Notes will be moved to unfiled.')) return;
    try {
      await api.delete(`/folders/${id}`);
      setFolders(prev => prev.filter(f => f.id !== id));
    } catch { alert('Could not delete folder.'); }
  };

  const handleRenameFolder = async (id, name) => {
    try {
      const res = await api.put(`/folders/${id}`, { name });
      setFolders(prev => prev.map(f => f.id === id ? res.data : f));
    } catch { alert('Could not rename folder.'); }
  };

  const handleFavoriteToggle = (id) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, isFavorite: !n.isFavorite } : n));
  };

  const activeFolderObj = folders.find(f => f.id === activeFolder);

  const filteredNotes = notes.filter(n => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q);
  });

  const toNoteCard = (note) => ({
    id: note.id,
    title: note.title,
    preview: note.content ? note.content.substring(0, 100) : 'Empty note',
    updatedAt: new Date(note.updatedAt).toLocaleDateString(),
    collaborators: 1,
    isFavorite: note.isFavorite,
    isDraft: note.isDraft,
  });

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav setSidebarOpen={setSidebarOpen} onCreateNote={handleCreateNote} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <main className="flex-1 overflow-auto px-6 sm:px-10 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                {activeFolder && (
                  <button
                    onClick={() => setActiveFolder(null)}
                    className="p-2 rounded-lg text-slate-400 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {activeFolder ? (activeFolderObj?.name || 'Folder') : 'My Notes'}
                  </h1>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {activeFolder ? `${filteredNotes.length} note${filteredNotes.length !== 1 ? 's' : ''}` : `${folders.length} folder${folders.length !== 1 ? 's' : ''} · ${notes.length} unfiled note${notes.length !== 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* View toggle */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                  <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}>
                    <Grid className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}>
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {!activeFolder && (
                  <button
                    onClick={() => setShowCreateFolder(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <FolderPlus className="w-4 h-4 text-primary-500" /> New Folder
                  </button>
                )}

                <button
                  onClick={handleCreateNote}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" /> New Note
                </button>
              </div>
            </div>

            {/* Create Folder Modal */}
            {showCreateFolder && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-surface rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-foreground">Create Folder</h3>
                    <button onClick={() => setShowCreateFolder(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <input
                    autoFocus
                    type="text"
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleCreateFolder(); }}
                    placeholder="Folder name..."
                    className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setShowCreateFolder(false)} className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleCreateFolder} disabled={!newFolderName.trim()} className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50">
                      Create Folder
                    </button>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                {[...Array(6)].map((_, i) => (<div key={i} className="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />))}
              </div>
            ) : (
              <>
                {/* Folders section (only when not in a folder) */}
                {!activeFolder && folders.length > 0 && (
                  <section className="mb-8">
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Folders</h2>
                    <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1'}`}>
                      {folders.map((folder, idx) => (
                        <FolderCard
                          key={folder.id}
                          folder={folder}
                          noteCount={noteCounts[folder.id] || 0}
                          colorIndex={idx}
                          onDelete={handleDeleteFolder}
                          onRename={handleRenameFolder}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Notes section */}
                <section>
                  {!activeFolder && <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Unfiled Notes</h2>}

                  {filteredNotes.length === 0 ? (
                    <div className="text-center py-14 bg-surface border border-dashed border-border rounded-2xl">
                      <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium mb-1">No notes here</p>
                      <p className="text-slate-400 text-sm mb-4">Create a new note to get started</p>
                      <button onClick={handleCreateNote} className="px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">
                        + New Note
                      </button>
                    </div>
                  ) : (
                    <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                      {filteredNotes.map(note => (
                        <NoteCard key={note.id} note={toNoteCard(note)} onFavoriteToggle={handleFavoriteToggle} />
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
