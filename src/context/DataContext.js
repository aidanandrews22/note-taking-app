import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchUserData } from '../services/DataService';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          const { notes: fetchedNotes, todos: fetchedTodos } = await fetchUserData(user.uid);
          setNotes(fetchedNotes);
          setTodos(fetchedTodos);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [user]);

  const updateNotes = (newNotes) => {
    setNotes(newNotes);
  };

  const updateTodos = (newTodos) => {
    setTodos(newTodos);
  };

  return (
    <DataContext.Provider value={{ notes, todos, loading, error, updateNotes, updateTodos }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => useContext(DataContext);