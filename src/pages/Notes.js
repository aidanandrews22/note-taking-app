import React, { useEffect, useState, useRef } from 'react';
import { Route, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDataContext } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useDataReload } from '../hooks/useDataReload';
import { isUserAdmin } from '../services/DataService';
import NoteList from '../components/notes/NoteList';
import NoteView from '../components/notes/NoteView';
import NoteEdit from '../components/notes/NoteEdit';
import GraphView from '../components/common/GraphView';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Preview from '../components/markdown/Preview';
import Directory from '../components/notes/Directory';
import Header from '../components/layout/Header';
import { PlusCircle, RefreshCcw, BarChart2, Edit } from 'lucide-react';

const Notes = () => {
  const { notes, loading, error } = useDataContext();
  const { user } = useAuth();
  const reloadData = useDataReload();
  const location = useLocation();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const directoryRef = useRef(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const adminStatus = await isUserAdmin(user.uid);
        setIsAdmin(adminStatus);
      }
    };
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (directoryRef.current && !directoryRef.current.contains(event.target) && !event.target.closest('button[aria-label="Toggle directory"]')) {
        if (location.pathname !== '/notes') {
          setIsDirectoryOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [location]);

  useEffect(() => {
    // Automatically open directory on note list page
    if (location.pathname === '/notes') {
      setIsDirectoryOpen(true);
    } else {
      setIsDirectoryOpen(false);
    }
  }, [location]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!user) return <ErrorMessage message="Please sign in to view your notes." />;

  const isListView = location.pathname === '/notes';
  const isEditView = location.pathname.includes('/edit');

  const toggleViewMode = () => {
    if (isEditView) {
      setIsPreview(!isPreview);
    } else {
      setViewMode(viewMode === 'list' ? 'graph' : 'list');
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const toggleDirectory = () => {
    setIsDirectoryOpen(!isDirectoryOpen);
  };

  const filteredNotes = selectedCategory
    ? notes.filter(note => note.category === selectedCategory)
    : notes;

  const graphData = {
    nodes: [
      ...filteredNotes.map(note => ({ id: note.id, name: note.title, val: 10 })),
      ...Array.from(new Set(filteredNotes.map(note => note.category))).map(category => ({ id: category, name: category, val: 20, isCategory: true }))
    ],
    links: filteredNotes.map(note => ({ source: note.id, target: note.category, distance: 50 }))
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header toggleDirectory={toggleDirectory} isDirectoryOpen={isDirectoryOpen} />
      <div className="flex flex-grow container mt-10 mx-auto px-4">
        <div 
          ref={directoryRef}
          className={`
            fixed md:relative md:w-64
            top-0 left-0 bg-white z-20
            transition-all duration-300 ease-in-out
            ${isDirectoryOpen ? 'translate-x-0' : '-translate-x-full'}
            max-w-xs rounded-lg shadow-lg
            ${isDirectoryOpen ? 'mt-4 ml-4 mb-4' : 'mt-4 -ml-64'}
          `}
        >
          <Directory 
            notes={notes} 
            onClose={() => setIsDirectoryOpen(false)}
            isOpen={isDirectoryOpen}
          />
        </div>
        <div className={`flex-grow transition-all duration-300 ease-in-out ${isDirectoryOpen ? 'md:ml-4' : 'ml-0'}`}>
          {isListView && (
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">My Notes</h2>
              <div className="space-x-2">
                <button
                  onClick={reloadData}
                  className="btn btn-secondary btn-icon"
                  title="Reload Data"
                >
                  <RefreshCcw className="h-5 w-5" />
                </button>
                <Link 
                  to="/notes/new" 
                  className="btn btn-primary btn-icon"
                  title="New Note"
                >
                  <PlusCircle className="h-5 w-5" />
                </Link>
              </div>
            </div>
          )}
          {viewMode === 'list' ? (
            <Routes>
              <Route index element={<NoteList userId={user.uid} isAdmin={isAdmin} />} />
              <Route path=":noteId" element={<NoteView userId={user.uid} isAdmin={isAdmin} />} />
              <Route path=":noteId/edit" element={
                isPreview ? 
                  <Preview doc={notes.find(n => n.id === location.pathname.split('/')[2])?.content || ''} /> :
                  <NoteEdit userId={user.uid} isAdmin={isAdmin} onTogglePreview={toggleViewMode} />
              } />
              <Route path="new" element={<NoteEdit userId={user.uid} isAdmin={isAdmin} onTogglePreview={toggleViewMode} />} />
            </Routes>
          ) : (
            <GraphView 
              data={graphData} 
              type="notes"
              onNodeClick={handleCategoryClick}
            />
          )}
        </div>
        <button
          className="fixed bottom-4 right-4 btn btn-primary btn-icon rounded-full shadow-lg"
          onClick={toggleViewMode}
          title={isEditView ? (isPreview ? 'Edit' : 'Preview') : (viewMode === 'list' ? 'Graph View' : 'List View')}
        >
          {isEditView ? 
            (isPreview ? <Edit className="h-5 w-5" /> : <Edit className="h-5 w-5" />) : 
            (viewMode === 'list' ? <BarChart2 className="h-5 w-5" /> : <BarChart2 className="h-5 w-5" />)
          }
        </button>
      </div>
    </div>
  );
};

export default Notes;