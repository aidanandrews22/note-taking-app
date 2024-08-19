import { useCallback } from 'react';
import { useDataContext } from '../context/DataContext';
import { fetchUserData } from '../services/DataService';
import { useAuth } from '../context/AuthContext';

export const useDataReload = () => {
  const { updateNotes } = useDataContext();
  const { user } = useAuth();

  const reloadData = useCallback(async () => {
    if (user) {
      try {
        window.location.reload();
        const { notes, todos } = await fetchUserData(user.uid);
        updateNotes(notes);
        // You might want to add a function to update todos as well
      } catch (error) {
        console.error('Error reloading data:', error);
      }
    }
  }, [user, updateNotes]);

  return reloadData;
};