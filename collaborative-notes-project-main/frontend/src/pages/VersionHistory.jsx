import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, RotateCcw } from 'lucide-react';
import Navbar from '../components/layout/Navbar';

export default function VersionHistory() {
  const { id } = useParams();

  const history = [
    { id: 1, timestamp: 'Today at 2:30 PM', user: 'Alice', action: 'Edited Section 2' },
    { id: 2, timestamp: 'Yesterday at 4:15 PM', user: 'You', action: 'Added Introduction' },
    { id: 3, timestamp: 'Oct 12 at 10:00 AM', user: 'Bob', action: 'Created Note' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-border">
          <Link to={`/notes/${id}`} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Version History</h1>
            <p className="text-slate-500 text-sm mt-1">Note: {id}</p>
          </div>
        </div>

        <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 py-4 space-y-12">
          {history.map((item, index) => (
            <div key={item.id} className="relative pl-8">
              {/* Timeline marker */}
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-primary-100 border-2 border-primary-500 shadow" />
              
              <div className="bg-surface border border-border p-5 rounded-xl shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {item.timestamp}
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition self-start sm:self-auto">
                    <RotateCcw className="w-4 h-4" />
                    Restore this version
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                    {item.user.charAt(0)}
                  </div>
                  <p className="text-foreground text-sm font-medium">{item.user}</p>
                  <span className="text-slate-400 text-sm">— {item.action}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
