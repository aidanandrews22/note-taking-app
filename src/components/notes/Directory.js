import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, File, X, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Directory = ({ items, onClose, isOpen }) => {
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

  const categories = [...new Set(items.map(item => item.category))];

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`directory bg-white shadow-lg ${isOpen ? 'directory-open' : 'directory-closed'}`}>
      {/* ... rest of the component remains the same ... */}
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
                {filteredItems
                  .filter(item => item.category === category)
                  .map(item => (
                    <li key={item.id} className="my-2">
                      <Link 
                        to={`/${item.category.toLowerCase()}/${item.id}`}
                        className={`flex items-center p-2 rounded hover:bg-gray-100 ${location.pathname === `/${item.category.toLowerCase()}/${item.id}` ? 'text-blue-500 font-semibold' : ''}`}
                      >
                        <File className="h-4 w-4 mr-2" />
                        {item.title}
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