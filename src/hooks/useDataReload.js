import { useCallback } from 'react';
import { useDataContext } from '../context/DataContext';
import { fetchUserNotes } from '../services/DataService';
import { useAuth } from '../context/AuthContext';

export const useDataReload = () => {
  const { updateNotes } = useDataContext();
  const { user } = useAuth();

  const reloadData = useCallback(async () => {
    if (user) {
      try {
        window.location.reload();
        const notes = await fetchUserNotes(user.uid);
        updateNotes(notes);
      } catch (error) {
        console.error('Error reloading data:', error);
      }
    }
  }, [user, updateNotes]);

  return reloadData;
};