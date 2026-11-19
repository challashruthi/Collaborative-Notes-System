import { Link, useNavigate } from 'react-router-dom';
import { Clock, Heart, Download, Users, Folder, MoreVertical } from 'lucide-react';
import api from '../api/api';

export default function NoteCard({ note, onFavoriteToggle, showFolder = false }) {
  const navigate = useNavigate();

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.put(`/notes/${note.id}/toggle-favorite`);
      if (onFavoriteToggle) onFavoriteToggle(note.id);
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  const handleDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const content = `${note.title}\n${'='.repeat(note.title?.length || 10)}\n\n${note.preview || note.content || ''}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title || 'note'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isFav = note.isFavorite;

  return (
    <div className="group relative block p-5 rounded-2xl bg-surface border border-border hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden min-h-[200px] flex flex-col cursor-pointer"
      onClick={() => navigate(`/notes/${note.id}`)}
    >
      {/* Top gradient accent */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary-400 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Action buttons - appear on hover */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={handleFavorite}
          className={`p-1.5 rounded-lg transition-colors ${isFav ? 'text-rose-500 bg-rose-50 dark:bg-rose-500/10' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10'}`}
          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
        </button>
        <button
          onClick={handleDownload}
          className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          title="Download note"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Favorite indicator */}
      {isFav && (
        <div className="absolute top-3 right-3 group-hover:hidden">
          <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
        </div>
      )}

      {/* Draft badge */}
      {note.isDraft && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium mb-2 w-fit">
          Draft
        </span>
      )}

      {/* Folder badge */}
      {showFolder && note.folderName && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium mb-2 w-fit">
          <Folder className="w-3 h-3" /> {note.folderName}
        </span>
      )}

      <h3 className="text-base font-bold text-foreground mb-2 line-clamp-2 pr-8">{note.title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 flex-1 leading-relaxed">
        {note.preview || 'Empty note'}
      </p>

      <div className="flex items-center justify-between text-xs font-medium text-slate-400 mt-auto pt-3 border-t border-border">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {note.updatedAt}
        </div>
        {note.collaborators > 1 && (
          <div className="flex items-center gap-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-1 rounded-md">
            <Users className="w-3.5 h-3.5" />
            {note.collaborators}
          </div>
        )}
      </div>
    </div>
  );
}
