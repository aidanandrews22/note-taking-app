import { getDatabase, ref, get, set, remove } from "firebase/database";
import { app } from '../firebase';

const db = getDatabase(app);

export const fetchUserNotes = async (userId) => {
  const privateNotesRef = ref(db, `notes/private/${userId}`);
  const publicNotesRef = ref(db, 'notes/public');
  
  const [privateSnapshot, publicSnapshot] = await Promise.all([
    get(privateNotesRef),
    get(publicNotesRef)
  ]);

  const privateNotes = privateSnapshot.exists() 
    ? Object.entries(privateSnapshot.val()).map(([id, note]) => ({ id, ...note, isPublic: false }))
    : [];

  const publicNotes = publicSnapshot.exists()
    ? Object.entries(publicSnapshot.val()).map(([id, note]) => ({ id, ...note, isPublic: true }))
    : [];

  return [...privateNotes, ...publicNotes];
};

export const saveNote = async (userId, noteId, noteData) => {
  const { isPublic, ...data } = noteData;
  const now = new Date();
  const lastEdited = now.getTime();
  const formattedDate = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD

  let notePath;
  let newNoteId;

  if (isPublic) {
    notePath = `notes/public`;
  } else {
    notePath = `notes/private/${userId}`;
  }

  if (!noteId) {
    // Creating a new note
    newNoteId = `note${now.getTime()}`;
    noteId = newNoteId;
  }

  const noteRef = ref(db, `${notePath}/${noteId}`);

  const updatedData = {
    ...data,
    userId,
    id: noteId,
    date: formattedDate,
    lastEdited
  };

  await set(noteRef, updatedData);

  return noteId;
};

export const deleteNote = async (userId, noteId, isPublic) => {
  const notePath = isPublic 
    ? `notes/public/${noteId}`
    : `notes/private/${userId}/${noteId}`;
  const noteRef = ref(db, notePath);
  await remove(noteRef);
};

export const isUserAdmin = async (userId) => {
  const adminRef = ref(db, `admins/${userId}`);
  const snapshot = await get(adminRef);
  return snapshot.exists();
};