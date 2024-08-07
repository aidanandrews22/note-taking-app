import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import PrivateRoute from './components/auth/PrivateRoute';
import SignIn from './components/auth/SignIn';
import Notes from './pages/Notes';
import Header from './components/layout/Header';

const App = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            {/* <Header /> */}
            <main className="flex-grow container mx-auto px-4 py-4">
              <Routes>
                <Route path="/signin" element={<SignIn />} />
                <Route 
                  path="/notes/*" 
                  element={
                    <PrivateRoute>
                      <Notes />
                    </PrivateRoute>
                  } 
                />
                <Route path="*" element={<Navigate to="/notes" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;