import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, File, X, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Directory = ({ notes, onClose, isOpen }) => {
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();

  const toggleCategory = (category) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const categories = [...new Set(notes.map(note => note.category))];

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`directory bg-white shadow-lg ${isOpen ? 'directory-open' : 'directory-closed'}`}>
      <div className="sticky top-0 bg-white z-10 p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Directory</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close directory"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-8 border rounded"
          />
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>
      <div className="directory-content p-4">
        {categories.map(category => (
          <div key={category} className="mb-4">
            <button 
              className="category-button flex items-center w-full text-left p-2 rounded hover:bg-gray-100"
              onClick={() => toggleCategory(category)}
            >
              {expandedCategories.includes(category) ? (
                <ChevronDown className="h-4 w-4 mr-2" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2" />
              )}
              {category}
            </button>
            <div className={`category-items ${expandedCategories.includes(category) ? 'expanded' : ''}`}>
              <ul className="pl-6">
                {filteredNotes
                  .filter(note => note.category === category)
                  .map(note => (
                    <li key={note.id} className="my-2">
                      <Link 
                        to={`/notes/${note.id}`}
                        className={`flex items-center p-2 rounded hover:bg-gray-100 ${location.pathname === `/notes/${note.id}` ? 'text-blue-500 font-semibold' : ''}`}
                      >
                        <File className="h-4 w-4 mr-2" />
                        {note.title}
                      </Link>
                    </li>
                  ))
                }
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Directory;