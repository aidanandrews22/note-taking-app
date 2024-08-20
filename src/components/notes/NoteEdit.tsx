import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDataContext } from '../../context/DataContext';
import { saveCalendarItem, saveTodoItem, fetchUserData, Note, Todo } from '../../services/DataService';
import { useAuth } from '../../context/AuthContext';
import CodeMirrorEditor from '../markdown/CodeMirrorEditor';
import Preview from '../markdown/Preview';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

interface NoteEditProps {
  userId: string;
  isAdmin: boolean;
  onTogglePreview: () => void;
}

type NoteOrTodo = (Note | Todo) & { content?: string };

const NoteEdit: React.FC<NoteEditProps> = ({ userId, isAdmin, onTogglePreview }) => {
  const [note, setNote] = useState<NoteOrTodo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [isSideBySide, setIsSideBySide] = useState<boolean>(false);
  const [contentHeight, setContentHeight] = useState<number>(300);
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const { updateTodoItems, updateCalendarItems } = useDataContext();
  const location = useLocation();

  useEffect(() => {
    const fetchNote = async () => {
      if (noteId && noteId !== 'new') {
        try {
          const { notes, todos } = await fetchUserData(userId);
          const fetchedNote = [...notes, ...todos].find(n => n.id === noteId);
          if (fetchedNote) {
            setNote(fetchedNote as NoteOrTodo);
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note) return;
    setSaving(true);
    setError(null);
  
    try {
      if (note.category === 'Todo') {
        await saveTodoItem(userId, noteId === 'new' ? null : noteId || null, note as Todo);
        const { todos: updatedTodos } = await fetchUserData(userId);
        updateTodoItems(updatedTodos);
      } else {
        await saveCalendarItem(userId, noteId === 'new' ? null : noteId || null, note as Todo);
        const { todos: updatedCalendarItems } = await fetchUserData(userId);
        updateCalendarItems(updatedCalendarItems);
      }
      navigate(note.category === 'Todo' ? '/todos' : `/calendar/${noteId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleChange = useCallback((newContent: string) => {
    setNote(prev => prev ? { ...prev, content: newContent } : null);
  }, []);

  const handleHeightChange = useCallback((height: number) => {
    setContentHeight(height);
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!note) return <ErrorMessage message="Note not found" />;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="label">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={note.title}
          onChange={(e) => setNote(prev => prev ? { ...prev, title: e.target.value } : null)}
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
          onChange={(e) => setNote(prev => prev ? { ...prev, category: e.target.value } : null)}
          className="input"
        >
          <option value="Misc">Misc</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Todo">Todo</option>
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
            initialDoc={note.content || ''}
            onChange={handleChange}
            onHeightChange={handleHeightChange}
          />
        </div>
        {isSideBySide && (
          <div 
            className="preview-container w-1/2"
            style={{ height: `${contentHeight}px`, overflowY: 'auto' }}
          >
            <Preview doc={note.content || ''} />
          </div>
        )}
      </div>
      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
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