// src/context/DataContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchUserNotes } from '../services/DataService';
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
          const fetchedNotes = await fetchUserNotes(user.uid);
          const notesData = fetchedNotes;
          const todosData = fetchedNotes.filter(note => note.category === 'Todo');
          setNotes(notesData);
          setTodos(todosData);
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
    const notesData = newNotes.filter(note => note.category !== 'Todo');
    const todosData = newNotes.filter(note => note.category === 'Todo');
    setNotes(notesData);
    setTodos(todosData);
  };

  return (
    <DataContext.Provider value={{ notes, todos, loading, error, updateNotes }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => useContext(DataContext);