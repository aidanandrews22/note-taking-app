import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDataContext } from '../../context/DataContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Preview from '../markdown/Preview';

const NoteView: React.FC<{ userId: string, isAdmin: boolean }> = ({ userId, isAdmin }) => {
  const { notes, loading, error } = useDataContext();
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  const note = notes.find((n: { id: any; }) => n.id === noteId);

  if (!note) return <ErrorMessage message="Note not found" />;

  const canEdit = isAdmin || (!note.isPublic && note.userId === userId);

  return (
    <div>
      <Link to="/notes" className="text-blue-500 hover:underline mb-4 inline-block">&larr; Back to all notes</Link>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{note.title}</h1>
        <div className="text-sm text-gray-600">
          <span>Category: {note.category}</span>
          {note.lastEdited && (
            <>
              <span className="mx-2">|</span>
              <span>Last edited: {new Date(note.lastEdited).toLocaleDateString()}</span>
            </>
          )}
          {note.isPublic && <span className="mx-2">| Public</span>}
        </div>
      </div>
      <div className="prose max-w-none">
        <Preview doc={note.content} />
      </div>
      {canEdit && (
        <Link to={`/notes/${noteId}/edit`} className="mt-4 inline-block bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark">
          Edit Note
        </Link>
      )}
    </div>
  );
};

export default NoteView;