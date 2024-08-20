import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchUserData } from '../services/DataService';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [calendarItems, setCalendarItems] = useState([]);
  const [todoItems, setTodoItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          setLoading(true);
          console.log('Loading data for user:', user.uid);
          const { notes: fetchedNotes, todos: fetchedTodos } = await fetchUserData(user.uid);
          console.log('Fetched notes:', fetchedNotes);
          console.log('Fetched todos:', fetchedTodos);
          setNotes(fetchedNotes || []);
          setTodoItems(fetchedTodos || []);
        } catch (err) {
          console.error('Error loading data:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [user]);

  const updateNotes = (newNotes) => {
    setNotes(newNotes || []);
  };

  const updateTodoItems = (newTodoItems) => {
    setTodoItems(newTodoItems || []);
  };

  const updateCalendarItems = (newCalendarItems) => {
    setCalendarItems(newCalendarItems || []);
  };

  return (
    <DataContext.Provider value={{ 
      notes, 
      todoItems, 
      loading, 
      error, 
      updateNotes, 
      updateTodoItems,
      updateCalendarItems
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => useContext(DataContext);