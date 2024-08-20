import { getDatabase, ref, get, set, remove } from "firebase/database";
import { app } from '../firebase';

const db = getDatabase(app);

export const fetchUserData = async (userId) => {
  const notesRef = ref(db, `notes/private/${userId}`);
  const todosRef = ref(db, `todos/${userId}`);
  const publicNotesRef = ref(db, 'notes/public');
  
  try {
    const [notesSnapshot, todosSnapshot, publicSnapshot] = await Promise.all([
      get(notesRef),
      get(todosRef),
      get(publicNotesRef)
    ]);

    console.log('Private notes snapshot:', notesSnapshot.val());
    console.log('Todos snapshot:', todosSnapshot.val());
    console.log('Public notes snapshot:', publicSnapshot.val());

    const privateNotes = notesSnapshot.exists() 
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

    return { notes: [...privateNotes, ...publicNotes], todos };
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
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

  try {
    await set(noteRef, updatedData);
    console.log('Note saved successfully:', noteId);
    return noteId;
  } catch (error) {
    console.error('Error saving note:', error);
    throw error;
  }
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

  try {
    await set(todoRef, updatedData);
    console.log('Todo saved successfully:', todoId);
    return todoId;
  } catch (error) {
    console.error('Error saving todo:', error);
    throw error;
  }
};

export const deleteNote = async (userId, noteId, isPublic) => {
  const notePath = isPublic 
    ? `notes/public/${noteId}`
    : `notes/private/${userId}/${noteId}`;
  const noteRef = ref(db, notePath);
  
  try {
    await remove(noteRef);
    console.log('Note deleted successfully:', noteId);
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};

export const deleteTodo = async (userId, todoId) => {
  const todoRef = ref(db, `todos/${userId}/${todoId}`);
  
  try {
    await remove(todoRef);
    console.log('Todo deleted successfully:', todoId);
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
};

export const isUserAdmin = async (userId) => {
  const adminRef = ref(db, `admins/${userId}`);
  const snapshot = await get(adminRef);
  return snapshot.exists();
};

export const deleteCalendarItem = async (userId, itemId) => {
  const itemRef = ref(db, `todos/${userId}/${itemId}`);
  
  try {
    await remove(itemRef);
    console.log('Calendar item deleted successfully:', itemId);
  } catch (error) {
    console.error('Error deleting calendar item:', error);
    throw error;
  }
};

export const saveCalendarItem = async (userId, itemId, itemData) => {
  const now = new Date();
  const lastEdited = now.getTime();

  if (!itemId) {
    itemId = `calendarItem${now.getTime()}`;
  }

  const itemRef = ref(db, `todos/${userId}/${itemId}`);

  const updatedData = {
    ...itemData,
    userId,
    id: itemId,
    lastEdited,
    start: itemData.start instanceof Date ? itemData.start.toISOString() : itemData.start,
    end: itemData.end instanceof Date ? itemData.end.toISOString() : itemData.end
  };

  try {
    await set(itemRef, updatedData);
    console.log('Calendar item saved successfully:', itemId);
    return itemId;
  } catch (error) {
    console.error('Error saving calendar item:', error);
    throw error;
  }
};

export const deleteTodoItem = deleteTodo;

export const saveTodoItem = saveTodo;
