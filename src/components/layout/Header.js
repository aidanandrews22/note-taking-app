import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { Home, LogOut, User, ChevronDown, Menu, CheckSquare } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ toggleDirectory, isDirectoryOpen }) => {
  const { user } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();

  const handleSignOut = () => {
    signOut(auth).catch((error) => {
      console.error('Error signing out: ', error);
    });
  };

  return (
    <header className="header text-black p-4 bg-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={toggleDirectory}
            className="mr-4"
            aria-label="Toggle directory"
          >
            <Menu className={`h-6 w-6 transition-transform duration-300 ${isDirectoryOpen ? 'transform rotate-90' : ''}`} />
          </button>
          <Link to="/" className="flex items-center">
            <Home className="h-6 w-6 mr-2" />
            <span className="text-2xl font-bold hidden md:inline">Aidan Andrews App</span>
          </Link>
        </div>
        {user && (
          <div className="flex items-center">
            <Link to="/todos" className="mr-4 flex items-center">
              <CheckSquare className="h-6 w-6 mr-2" />
              <span className="hidden md:inline">Todos</span>
            </Link>
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center text-sm focus:outline-none"
              >
                <User className="h-5 w-5 mr-1" />
                <span className="hidden md:inline mr-1">Profile</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <div className="px-4 py-2 text-sm text-gray-700">
                    {user.email}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>Sign Out</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;