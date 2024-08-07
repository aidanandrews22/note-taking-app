import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronDown, File, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Directory = ({ notes, onClose, isOpen }) => {
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [contentHeight, setContentHeight] = useState('auto');
  const contentRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight + 'px');
    }
  }, [expandedCategories, notes, isOpen]);

  const toggleCategory = (category) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const categories = [...new Set(notes.map(note => note.category))];

  return (
    <div className="directory-container bg-white h-full overflow-y-auto relative flex flex-col">
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
      <div 
        ref={contentRef}
        className="flex-grow p-4 overflow-hidden transition-all duration-300 ease-in-out"
        style={{ height: isOpen ? contentHeight : '0px' }}
      >
        {categories.map(category => (
          <div key={category} className="mb-2">
            <button 
              className="flex items-center w-full text-left"
              onClick={() => toggleCategory(category)}
            >
              {expandedCategories.includes(category) ? (
                <ChevronDown className="h-4 w-4 mr-1" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-1" />
              )}
              {category}
            </button>
            {expandedCategories.includes(category) && (
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
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Directory;