import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, File, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Directory = ({ notes, onClose, isOpen }) => {
  const [expandedCategories, setExpandedCategories] = useState([]);
  const location = useLocation();

  const toggleCategory = (category) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const categories = [...new Set(notes.map(note => note.category))];

  return (
    <div className={`directory ${isOpen ? 'directory-open' : 'directory-closed'}`}>
      <div className="sticky top-0 bg-white z-10 p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-bold">Directory</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close directory"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="directory-content">
        {categories.map(category => (
          <div key={category} className="mb-2">
            <button 
              className="category-button flex items-center"
              onClick={() => toggleCategory(category)}
            >
              {expandedCategories.includes(category) ? (
                <ChevronDown className="h-4 w-4 mr-1" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-1" />
              )}
              {category}
            </button>
            <div className={`category-items ${expandedCategories.includes(category) ? 'expanded' : ''}`}>
              <ul className="pl-4">
                {notes
                  .filter(note => note.category === category)
                  .map(note => (
                    <li key={note.id} className="my-1">
                      <Link 
                        to={`/notes/${note.id}`}
                        className={`flex items-center ${location.pathname === `/notes/${note.id}` ? 'text-blue-500 font-semibold' : ''}`}
                      >
                        <File className="h-4 w-4 mr-1" />
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