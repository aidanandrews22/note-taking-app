import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchUserNotes } from '../services/DataService';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadNotes = async () => {
      if (user) {
        try {
          const fetchedNotes = await fetchUserNotes(user.uid);
          setNotes(fetchedNotes);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    loadNotes();
  }, [user]);

  const updateNotes = (newNotes) => {
    setNotes(newNotes);
  };

  return (
    <DataContext.Provider value={{ notes, loading, error, updateNotes }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => useContext(DataContext);