import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import PrivateRoute from './components/auth/PrivateRoute';
import SignIn from './components/auth/SignIn';
import Notes from './pages/Notes';
import TodoList from './components/todo/TodoList';
import TodoCalendar from './components/calendar/TodoCalendar';
import Header from './components/layout/Header';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);

  const toggleDirectory = () => {
    setIsDirectoryOpen(prevState => !prevState);
  };

  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Header toggleDirectory={toggleDirectory} isDirectoryOpen={isDirectoryOpen} />
            <main className="flex-grow container mx-auto px-4 py-4">
              <Routes>
                <Route path="/signin" element={<SignIn />} />
                <Route 
                  path="/notes/*" 
                  element={
                    <PrivateRoute>
                      <Notes isDirectoryOpen={isDirectoryOpen} setIsDirectoryOpen={setIsDirectoryOpen} />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/todos" 
                  element={
                    <PrivateRoute>
                      <TodoList />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/todo-calendar" 
                  element={
                    <PrivateRoute>
                      <TodoCalendar />
                    </PrivateRoute>
                  } 
                />
                <Route path="*" element={<Navigate to="/notes" replace />} />
              </Routes>
            </main>
          </div>
          <ToastContainer />
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;