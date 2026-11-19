import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, Sparkles, X, Save, ArrowLeft, Trash2, Bold, Italic, Heading1, Heading2, List, Eye } from 'lucide-react';
import api from '../api/api';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [title, setTitle] = useState('Untitled Note');
  const [content, setContent] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState('');
  const [isSaved, setIsSaved] = useState(true);

  // Permission: 'OWNER' | 'EDIT' | 'VIEW' | null (loading)
  const [myPermission, setMyPermission] = useState(null);

  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState('VIEW');
  const [isSharing, setIsSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState(null);

  const isInitialMount = useRef(true);

  const canEdit = myPermission === 'OWNER' || myPermission === 'EDIT';

  // Initialize Tiptap Editor (start non-editable; editable state is set reactively via useEffect below)
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editable: false,
    onUpdate: ({ editor }) => {
      // Use the live editor.isEditable flag (not the stale canEdit closure)
      if (!editor.isEditable) return;
      setContent(editor.getHTML());
      setIsSaved(false);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg focus:outline-none min-h-[400px] max-w-none',
      },
    },
  });

  // 1. Fetch permission + note data on load
  useEffect(() => {
    const init = async () => {
      try {
        const [noteRes, permRes] = await Promise.all([
          api.get(`/notes/${id}`),
          api.get(`/notes/${id}/my-permission`),
        ]);
        const perm = permRes.data.permission;
        setMyPermission(perm);
        setTitle(noteRes.data.title || 'Untitled Note');
        setContent(noteRes.data.content || '');
        if (editor) {
          editor.commands.setContent(noteRes.data.content || '');
          // NOTE: editable state is now synced reactively in the effect below
        }
      } catch (err) {
        console.error('Load failed', err);
      }
    };
    if (editor) init();
  }, [id, editor]);

  // 1b. Reactively sync editable state whenever permission or editor changes
  //     This is the correct Tiptap pattern — avoids stale closure bugs.
  useEffect(() => {
    if (!editor) return;
    const shouldEdit = myPermission === 'OWNER' || myPermission === 'EDIT';
    editor.setEditable(shouldEdit);
  }, [editor, myPermission]);

  // 2. Debounced auto-save (owners/editors only)
  useEffect(() => {
    if (!canEdit) return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const timer = setTimeout(async () => {
      try {
        await api.put(`/notes/${id}`, { title, content });
        setIsSaved(true);
      } catch (err) {
        console.error('Save failed', err);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [title, content, id, canEdit]);

  const handleDelete = async () => {
    if (window.confirm('Delete this note?')) {
      try {
        await api.delete(`/notes/${id}`);
        navigate('/dashboard');
      } catch (err) {
        console.error('Delete failed', err);
        alert('Delete failed.');
      }
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    if (!shareEmail.trim()) return;
    setIsSharing(true);
    setShareMessage(null);
    try {
      await api.post(`/notes/${id}/share`, {
        email: shareEmail.trim(),
        permission: sharePermission,
      });
      setShareMessage({ type: 'success', text: `Note shared with ${shareEmail} successfully!` });
      setShareEmail('');
    } catch (err) {
      const msg = err.response?.data || 'Failed to share. Please try again.';
      setShareMessage({ type: 'error', text: typeof msg === 'string' ? msg : 'Failed to share.' });
    } finally {
      setIsSharing(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!editor || editor.isEmpty) {
      alert('Please write something first.');
      return;
    }
    setIsSummarizing(true);
    try {
      await api.put(`/notes/${id}`, { title, content: editor.getHTML() });
      const res = await api.post(`/notes/${id}/summarize`);
      setSummary(res.data.summary);
    } catch (err) {
      console.error('AI failed', err);
      setSummary('Failed to generate summary. Check your Gemini API Key.');
    } finally {
      setIsSummarizing(false);
    }
  };

  if (!editor || myPermission === null) return null;

  return (
    <div className="h-screen flex flex-col bg-white text-slate-900">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b shrink-0">
        <div className="flex items-center gap-4 flex-1">
          <button onClick={() => navigate('/dashboard')} className="p-2 text-slate-400 hover:text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              if (!canEdit) return;
              setTitle(e.target.value);
              setIsSaved(false);
            }}
            readOnly={!canEdit}
            className={`text-xl font-bold bg-transparent border-none focus:outline-none w-full max-w-md ${!canEdit ? 'cursor-default' : ''}`}
          />
          {canEdit && (
            <div className="text-xs font-medium">
              {isSaved ? (
                <span className="flex items-center gap-1 text-green-600">
                  <Save className="w-3.5 h-3.5" /> Saved to cloud
                </span>
              ) : (
                <span className="text-amber-600 animate-pulse">Saving...</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {myPermission === 'VIEW' && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold">
              <Eye className="w-3.5 h-3.5" /> View only
            </span>
          )}
          {myPermission === 'OWNER' && (
            <>
              <button onClick={handleDelete} className="p-2 text-slate-400 hover:text-red-500" title="Delete Note">
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => { setShowShareModal(true); setShareMessage(null); }}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
            </>
          )}
        </div>
      </header>

      {/* View-only banner */}
      {myPermission === 'VIEW' && (
        <div className="flex items-center gap-2 px-6 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-800 text-sm">
          <Eye className="w-4 h-4 shrink-0" />
          <span>You have <strong>view-only</strong> access to this note. Editing is disabled.</span>
        </div>
      )}

      {/* Editor Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto w-full">

            {/* Toolbar — owners and editors only */}
            {canEdit && (
              <div className="flex items-center gap-1 p-1 mb-6 border rounded-lg bg-slate-50 w-fit sticky top-0 z-10">
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`p-2 rounded ${editor.isActive('bold') ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-200'}`}
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`p-2 rounded ${editor.isActive('italic') ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-200'}`}
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  className={`p-2 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-200'}`}
                >
                  <Heading1 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={`p-2 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-200'}`}
                >
                  <Heading2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-200'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            )}

            <EditorContent editor={editor} />
          </div>
        </div>

        {/* AI Sidebar */}
        <div className="w-80 border-l bg-slate-50 p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6 text-indigo-600">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-bold">AI Assistant</h3>
          </div>

          {summary ? (
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold text-slate-700">Summary</h4>
                <button onClick={() => setSummary('')}><X className="w-4 h-4 text-slate-400" /></button>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{summary}</p>
            </div>
          ) : (
            <div className="text-center mt-10">
              <Sparkles className="w-8 h-8 text-slate-400 mx-auto mb-4" />
              <p className="text-sm text-slate-500 mb-6">Let Gemini AI summarize your note.</p>
              <button
                onClick={handleGenerateSummary}
                disabled={isSummarizing || editor.isEmpty}
                className="w-full bg-slate-900 text-white font-medium py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50"
              >
                {isSummarizing ? 'Generating...' : 'Generate Summary'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal (owner only) */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowShareModal(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-800">Share Note</h2>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleShare} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Recipient Email</label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Permission</label>
                <select
                  value={sharePermission}
                  onChange={(e) => setSharePermission(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                >
                  <option value="VIEW">View only</option>
                  <option value="EDIT">Can edit</option>
                </select>
              </div>

              {shareMessage && (
                <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
                  shareMessage.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {shareMessage.text}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSharing || !shareEmail.trim()}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 text-sm transition"
                >
                  {isSharing ? 'Sharing...' : 'Share'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default NoteEditor;
