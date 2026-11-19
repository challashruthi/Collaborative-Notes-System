import { useState } from 'react';
import { Folder, MoreVertical, Trash2, Edit2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

const FOLDER_COLORS = [
  'from-blue-400 to-blue-600',
  'from-violet-400 to-violet-600',
  'from-emerald-400 to-emerald-600',
  'from-amber-400 to-amber-600',
  'from-rose-400 to-rose-600',
  'from-cyan-400 to-cyan-600',
];

export default function FolderCard({ folder, noteCount = 0, onDelete, onRename, colorIndex = 0 }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const color = FOLDER_COLORS[colorIndex % FOLDER_COLORS.length];

  const handleRename = () => {
    if (newName.trim() && newName !== folder.name) {
      onRename(folder.id, newName.trim());
    }
    setIsRenaming(false);
    setShowMenu(false);
  };

  return (
    <div className="group relative bg-surface border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-300 hover:-translate-y-0.5">
      {/* Folder color header */}
      <div
        className={`h-16 bg-gradient-to-br ${color} flex items-center justify-center cursor-pointer relative`}
        onClick={() => !isRenaming && navigate(`/my-notes?folder=${folder.id}`)}
      >
        <Folder className="w-8 h-8 text-white opacity-90" />

        {/* Menu button */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="absolute top-2 right-2 p-1.5 bg-black/20 hover:bg-black/40 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {/* Dropdown menu */}
        {showMenu && (
          <div className="absolute top-10 right-2 w-36 bg-surface border border-border rounded-xl shadow-xl z-10 overflow-hidden" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => { setIsRenaming(true); setShowMenu(false); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Edit2 className="w-4 h-4 text-slate-400" /> Rename
            </button>
            <button
              onClick={() => { onDelete(folder.id); setShowMenu(false); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Folder info */}
      <div className="p-4">
        {isRenaming ? (
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setIsRenaming(false); }}
            className="w-full text-sm font-semibold bg-transparent border-b border-primary-400 focus:outline-none text-foreground"
          />
        ) : (
          <h3
            className="text-sm font-semibold text-foreground truncate cursor-pointer"
            onClick={() => navigate(`/my-notes?folder=${folder.id}`)}
          >
            {folder.name}
          </h3>
        )}
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-400">
          <FileText className="w-3.5 h-3.5" />
          <span>{noteCount} {noteCount === 1 ? 'note' : 'notes'}</span>
        </div>
      </div>
    </div>
  );
}
