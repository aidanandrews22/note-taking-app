import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDataContext } from '../../context/DataContext';
import { Note } from '../../services/DataService';

interface NoteListProps {
  userId: string;
}

const NoteList: React.FC<NoteListProps> = ({ userId }) => {
  const { notes, loading, error } = useDataContext();
  const [showPublic, setShowPublic] = useState(false);

  useEffect(() => {
    console.log('Notes in NoteList:', notes);
  }, [notes]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const filteredNotes = (notes || []).filter((note: Note) => 
    (note.isPublic && showPublic) || (!note.isPublic && note.userId === userId)
  );

  console.log('Filtered notes:', filteredNotes);

  return (
    <div>
      <div className="mb-4">
        <button 
          onClick={() => setShowPublic(!showPublic)}
          className="btn btn-primary"
        >
          {showPublic ? 'Show My Notes' : 'Show Public Notes'}
        </button>
      </div>
      {filteredNotes.length === 0 ? (
        <div>No notes found.</div>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((note: Note) => (
            <div key={note.id} className="bg-white shadow rounded-lg p-4">
              <Link to={`/notes/${note.id}`} className="text-lg font-semibold text-blue-500 hover:underline">
                {note.title}
              </Link>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(note.lastEdited).toLocaleDateString()} - {note.category}
                {note.isPublic && ' - Public'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoteList;