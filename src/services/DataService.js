import { getDatabase, ref, get, set, remove } from "firebase/database";
import { app } from '../firebase';

const db = getDatabase(app);

export const fetchUserData = async (userId) => {
  const notesRef = ref(db, `notes/${userId}`);
  const todosRef = ref(db, `todos/${userId}`);
  const calendarItemsRef = ref(db, `calendarItems/${userId}`);

  try {
    const [notesSnapshot, todosSnapshot, calendarItemsSnapshot] = await Promise.all([
      get(notesRef),
      get(todosRef),
      get(calendarItemsRef)
    ]);

    const notes = notesSnapshot.exists() 
      ? Object.entries(notesSnapshot.val()).map(([id, note]) => ({
          id,
          ...note,
        }))
      : [];

    const todos = todosSnapshot.exists()
      ? Object.entries(todosSnapshot.val()).map(([id, todo]) => ({
          id,
          ...todo,
          dueDate: todo.dueDate ? new Date(todo.dueDate) : null,
        }))
      : [];

    const calendarItems = calendarItemsSnapshot.exists()
      ? Object.entries(calendarItemsSnapshot.val()).map(([id, item]) => ({
          id,
          ...item,
          start: item.start ? new Date(item.start) : null,
          end: item.end ? new Date(item.end) : null,
        }))
      : [];

    return { notes, todos, calendarItems };
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

const saveItem = async (userId, itemId, itemData, path) => {
  const now = new Date();
  const lastEdited = now.getTime();

  if (!itemId) {
    itemId = `${path}${now.getTime()}`;
  }

  const itemRef = ref(db, `${path}/${userId}/${itemId}`);

  const updatedData = {
    ...itemData,
    id: itemId,
    lastEdited,
  };

  if (path === 'todos' && updatedData.dueDate instanceof Date) {
    updatedData.dueDate = updatedData.dueDate.toISOString();
  }

  if (path === 'calendarItems') {
    if (updatedData.start instanceof Date) updatedData.start = updatedData.start.toISOString();
    if (updatedData.end instanceof Date) updatedData.end = updatedData.end.toISOString();
    
    // Handle recurrence end date
    if (updatedData.recurrence && updatedData.recurrence.endDate instanceof Date) {
      updatedData.recurrence.endDate = updatedData.recurrence.endDate.toISOString();
    }
  }

  try {
    await set(itemRef, updatedData);
    return itemId;
  } catch (error) {
    console.error(`Error saving ${path}:`, error);
    throw error;
  }
};

export const saveNote = (userId, noteId, noteData) => saveItem(userId, noteId, noteData, 'notes');
export const saveTodo = (userId, todoId, todoData) => saveItem(userId, todoId, todoData, 'todos');
export const saveCalendarItem = (userId, itemId, itemData) => saveItem(userId, itemId, itemData, 'calendarItems');

const deleteItem = async (userId, itemId, path) => {
  const itemRef = ref(db, `${path}/${userId}/${itemId}`);
  
  try {
    await remove(itemRef);
  } catch (error) {
    console.error(`Error deleting ${path}:`, error);
    throw error;
  }
};

export const deleteNote = (userId, noteId) => deleteItem(userId, noteId, 'notes');
export const deleteTodo = (userId, todoId) => deleteItem(userId, todoId, 'todos');
export const deleteCalendarItem = (userId, itemId) => deleteItem(userId, itemId, 'calendarItems');

export const isUserAdmin = async (userId) => {
  const adminRef = ref(db, `admins/${userId}`);
  const snapshot = await get(adminRef);
  return snapshot.exists();
};

export const saveTodoItem = saveTodo;
export const deleteTodoItem = deleteTodo;