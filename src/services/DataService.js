import { getDatabase, ref, get, set, remove } from "firebase/database";
import { app } from '../firebase';

const db = getDatabase(app);

export const fetchUserData = async (userId) => {
  const notesRef = ref(db, `notes/private/${userId}`);
  const todosRef = ref(db, `todos/${userId}`);
  const publicNotesRef = ref(db, 'notes/public');
  
  const [notesSnapshot, todosSnapshot, publicSnapshot] = await Promise.all([
    get(notesRef),
    get(todosRef),
    get(publicNotesRef)
  ]);

  const notes = notesSnapshot.exists() 
    ? Object.entries(notesSnapshot.val()).map(([id, note]) => ({
        id,
        ...note,
        isPublic: false
      }))
    : [];

  const todos = todosSnapshot.exists()
    ? Object.entries(todosSnapshot.val()).map(([id, todo]) => ({
        id,
        ...todo,
        start: todo.start ? new Date(todo.start) : null,
        end: todo.end ? new Date(todo.end) : null
      }))
    : [];

  const publicNotes = publicSnapshot.exists()
    ? Object.entries(publicSnapshot.val()).map(([id, note]) => ({
        id,
        ...note,
        isPublic: true
      }))
    : [];

  return { notes: [...notes, ...publicNotes], todos };
};

export const saveNote = async (userId, noteId, noteData) => {
  const { isPublic, ...data } = noteData;
  const now = new Date();
  const lastEdited = now.getTime();

  let notePath = isPublic ? `notes/public` : `notes/private/${userId}`;
  
  if (!noteId) {
    noteId = `note${now.getTime()}`;
  }

  const noteRef = ref(db, `${notePath}/${noteId}`);

  const updatedData = {
    ...data,
    userId,
    id: noteId,
    lastEdited
  };

  await set(noteRef, updatedData);

  return noteId;
};

export const saveTodo = async (userId, todoId, todoData) => {
  const now = new Date();
  const lastEdited = now.getTime();

  if (!todoId) {
    todoId = `todo${now.getTime()}`;
  }

  const todoRef = ref(db, `todos/${userId}/${todoId}`);

  const updatedData = {
    ...todoData,
    userId,
    id: todoId,
    lastEdited,
    start: todoData.start instanceof Date ? todoData.start.toISOString() : todoData.start,
    end: todoData.end instanceof Date ? todoData.end.toISOString() : todoData.end
  };

  await set(todoRef, updatedData);

  return todoId;
};

export const deleteNote = async (userId, noteId, isPublic) => {
  const notePath = isPublic 
    ? `notes/public/${noteId}`
    : `notes/private/${userId}/${noteId}`;
  const noteRef = ref(db, notePath);
  await remove(noteRef);
};

export const deleteTodo = async (userId, todoId) => {
  const todoRef = ref(db, `todos/${userId}/${todoId}`);
  await remove(todoRef);
};

export const isUserAdmin = async (userId) => {
  const adminRef = ref(db, `admins/${userId}`);
  const snapshot = await get(adminRef);
  return snapshot.exists();
};