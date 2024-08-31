import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import PrivateRoute from './components/auth/PrivateRoute';
import SignIn from './components/auth/SignIn';
import Notes from './pages/Notes';
import TodoList from './components/todo/TodoList';
import CalendarView from './components/calendar/CalendarView';
import Header from './components/layout/Header';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CalendarItemView from './components/calendar/CalendarItemView';
import CalendarItemForm from './components/calendar/CalendarItemForm';
import TodoItemView from './components/todo/TodoItemView';
import AnalyticsDashboard from './components/common/AnalyticsDashboard.js';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';

const DebugComponent = () => {
  const { user, loading } = useAuth();
  // console.log('Auth State:', { user, loading });
  return null;
};

const App = () => {
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);

  const toggleDirectory = () => {
    setIsDirectoryOpen(prevState => !prevState);
  };

  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <DebugComponent />
          <div className="flex flex-col min-h-screen">
            <Header toggleDirectory={toggleDirectory} isDirectoryOpen={isDirectoryOpen} />
            <main className="flex-grow container mx-auto px-4 py-4">
              <Routes>
                <Route path="/signin" element={<SignIn />} />
                <Route path="/" element={<LandingPage />} />
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
                  path="/todos/:itemId" 
                  element={
                    <PrivateRoute>
                      <TodoItemView />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/todos/new" 
                  element={
                    <PrivateRoute>
                      <TodoItemView />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/calendar" 
                  element={
                    <PrivateRoute>
                      <CalendarView />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/calendar/:itemId" 
                  element={
                    <PrivateRoute>
                      <CalendarItemView />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/calendar/new" 
                  element={
                    <PrivateRoute>
                      <CalendarItemForm />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/analytics" 
                  element={
                    <PrivateRoute>
                      <AnalyticsDashboard />
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