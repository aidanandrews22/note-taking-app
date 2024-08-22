import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { fetchUserData } from '../services/DataService';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [todos, setTodos] = useState([]);
  const [calendarItems, setCalendarItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const loadData = useCallback(async () => {
    if (user) {
      setLoading(true);
      setError(null);
      console.log('Loading data for user:', user.uid);

      try {
        const { notes: fetchedNotes, todos: fetchedTodos, calendarItems: fetchedCalendarItems } = await fetchUserData(user.uid);
        setNotes(fetchedNotes || []);
        setTodos(fetchedTodos || []);
        setCalendarItems(fetchedCalendarItems || []);
        console.log('Loaded todos:', fetchedTodos);
        console.log('Loaded calendarItems:', fetchedCalendarItems);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message || 'An error occurred while loading data');
      } finally {
        setLoading(false);
      }
    } else {
      // Reset data when user logs out
      setNotes([]);
      setTodos([]);
      setCalendarItems([]);
      setLoading(false);
      setError(null);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <DataContext.Provider value={{
      notes,
      todos,
      calendarItems,
      loading,
      error,
      updateNotes: setNotes,
      updateTodos: setTodos,
      updateCalendarItems: setCalendarItems,
      reloadData: loadData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};