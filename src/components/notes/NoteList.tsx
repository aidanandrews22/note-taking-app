import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDataContext } from '../../context/DataContext';

interface UserProps {
  userId: string;
}

const NoteList: React.FC<UserProps> = ({ userId }) => {
  const { notes } = useDataContext();
  const [showPublic, setShowPublic] = useState(false);

  const filteredNotes = notes.filter((note: { isPublic: any; userId: any; }) => 
    (note.isPublic && showPublic) || (!note.isPublic && note.userId === userId)
  );

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
      <div className="space-y-4">
        {filteredNotes.map((note: { id: React.Key | null | undefined; title: any; lastEdited: string | number | Date; category: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; isPublic: any; }) => (
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
    </div>
  );
};

export default NoteList;