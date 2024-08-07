import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { saveNote, fetchUserNotes } from '../../services/DataService';
import { useDataContext } from '../../context/DataContext';
import CodeMirrorEditor from '../markdown/CodeMirrorEditor';
import Preview from '../markdown/Preview';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

interface Note {
  title: string;
  content: string;
  category: string;
  isPublic: boolean;
}

const NoteEdit: React.FC<{ userId: string, isAdmin: boolean, onTogglePreview: () => void }> = ({ userId, isAdmin, onTogglePreview }) => {
  const [note, setNote] = useState<Note>({ title: '', content: '', category: 'Misc', isPublic: false });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [isSideBySide, setIsSideBySide] = useState<boolean>(false);
  const [contentHeight, setContentHeight] = useState<number>(300);
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const { updateNotes } = useDataContext();
  const location = useLocation();

  useEffect(() => {
    const fetchNote = async () => {
      if (noteId && noteId !== 'new') {
        try {
          const notes = await fetchUserNotes(userId);
          const fetchedNote = notes.find(n => n.id === noteId);
          if (fetchedNote) {
            setNote(fetchedNote);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchNote();
  }, [noteId, userId]);

  const handleChange = useCallback((newContent: string) => {
    setNote(prevNote => ({ ...prevNote, content: newContent }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
  
    try {
      const savedNoteId = await saveNote(userId, noteId === 'new' ? null : noteId, note);
      const updatedNotes = await fetchUserNotes(userId);
      updateNotes(updatedNotes);
      navigate(`/notes/${savedNoteId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleHeightChange = useCallback((height: number) => {
    setContentHeight(height);
  }, []);

  let url = location.pathname;
  url = url.endsWith('/edit') ? url.slice(0, -5) : url.endsWith('/edit/') ? url.slice(0, -6) : url;

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="label">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={note.title}
          onChange={(e) => setNote(prev => ({ ...prev, title: e.target.value }))}
          className="input"
          required
        />
      </div>
      <div>
        <label htmlFor="category" className="label">Category</label>
        <select
          id="category"
          name="category"
          value={note.category}
          onChange={(e) => setNote(prev => ({ ...prev, category: e.target.value }))}
          className="input"
        >
          <option value="Misc">Misc</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
        </select>
      </div>
      <div className="flex justify-between mb-2">
        <label htmlFor="content" className="label">Content</label>
        <div className="space-x-2">
          <button
            type="button"
            onClick={() => setIsSideBySide(!isSideBySide)}
            className="btn btn-secondary btn-sm"
          >
            {isSideBySide ? 'Single View' : 'Side-by-Side'}
          </button>
        </div>
      </div>
      <div className={`editor-preview-container ${isSideBySide ? 'flex' : ''}`}>
        <div className={isSideBySide ? 'w-1/2' : 'w-full'}>
          <CodeMirrorEditor
            initialDoc={note.content}
            onChange={handleChange}
            onHeightChange={handleHeightChange}
          />
        </div>
        {isSideBySide && (
          <div 
            className="preview-container w-1/2"
            style={{ height: `${contentHeight}px`, overflowY: 'auto' }}
          >
            <Preview doc={note.content} />
          </div>
        )}
      </div>
      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={() => navigate(url)}
          className="btn btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Note'}
        </button>
      </div>
    </form>
  );
};

export default NoteEdit;