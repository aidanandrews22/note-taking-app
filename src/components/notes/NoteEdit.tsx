import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDataContext } from '../../context/DataContext';
import { fetchUserData, Note, saveNote } from '../../services/DataService';
import { useAuth } from '../../context/AuthContext';
import CodeMirrorEditor from '../markdown/CodeMirrorEditor';
import Preview from '../markdown/Preview';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import debounce from 'lodash/debounce';
import { X, Save, Eye, Edit2, ChevronLeft, Maximize, Minimize } from 'lucide-react';

interface NoteEditProps {
  userId: string;
  isAdmin: boolean;
}

const NoteEdit: React.FC<NoteEditProps> = ({ userId, isAdmin }) => {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const { updateNotes } = useDataContext();
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNote = async () => {
      if (noteId && noteId !== 'new') {
        try {
          setLoading(true);
          const { notes } = await fetchUserData(userId);
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
        setNote({
          id: '',
          title: '',
          content: '',
          category: 'Misc',
          isPublic: false,
          lastEdited: Date.now(),
          userId: userId
        });
        setLoading(false);
      }
    };
  
    fetchNote();
  }, [noteId, userId]);

  const saveNoteDebounced = useCallback(
    debounce(async (noteToSave: Note) => {
      setSaving(true);
      setError(null);
      try {
        const savedNoteId = await saveNote(userId, noteToSave.id || null, noteToSave);
        const { notes: updatedNotes } = await fetchUserData(userId);
        updateNotes(updatedNotes);
        if (noteToSave.id === '') {
          navigate(`/notes/${savedNoteId}`, { replace: true });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setSaving(false);
      }
    }, 1000),
    [userId, updateNotes, navigate]
  );

  const handleChange = useCallback((newContent: string) => {
    setNote(prev => {
      if (!prev) return null;
      const updatedNote = { ...prev, content: newContent, lastEdited: Date.now() };
      saveNoteDebounced(updatedNote);
      return updatedNote;
    });
  }, [saveNoteDebounced]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNote(prev => {
      if (!prev) return null;
      const updatedNote = { ...prev, title: e.target.value, lastEdited: Date.now() };
      saveNoteDebounced(updatedNote);
      return updatedNote;
    });
  }, [saveNoteDebounced]);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setNote(prev => {
      if (!prev) return null;
      const updatedNote = { ...prev, category: e.target.value, lastEdited: Date.now() };
      saveNoteDebounced(updatedNote);
      return updatedNote;
    });
  }, [saveNoteDebounced]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!note) return <ErrorMessage message="Note not found" />;

  return (
    <div 
      ref={containerRef}
      className={`note-edit ${isFullscreen ? 'fixed inset-0 z-50 bg-white overflow-auto' : ''}`}
    >
      <div className="bg-white z-10 p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => navigate(-1)} className="btn btn-ghost">
            <ChevronLeft size={24} />
          </button>
          <div className="flex space-x-2">
            <button onClick={() => setIsPreview(!isPreview)} className="btn btn-ghost">
              {isPreview ? <Edit2 size={24} /> : <Eye size={24} />}
            </button>
            <button onClick={toggleFullscreen} className="btn btn-ghost">
              {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
            </button>
          </div>
        </div>
        <input
          type="text"
          value={note.title}
          onChange={handleTitleChange}
          className="w-full text-4xl font-bold mb-2 p-2 border-b focus:outline-none focus:border-blue-500"
          placeholder="Note Title"
        />
        <div className="mb-4">
          <select
            value={note.category}
            onChange={handleCategoryChange}
            className="p-2 border rounded"
          >
            <option value="Misc">Misc</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
          </select>
        </div>
      </div>
      <div className="p-4">
        {isPreview ? (
          <div className="preview-container w-full">
            <Preview doc={note.content} />
          </div>
        ) : (
          <div className="w-full">
            <CodeMirrorEditor
              initialDoc={note.content}
              onChange={handleChange}
              editorRef={editorRef}
            />
          </div>
        )}
      </div>
      {saving && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded">
          Saving...
        </div>
      )}
    </div>
  );
};

export default NoteEdit;