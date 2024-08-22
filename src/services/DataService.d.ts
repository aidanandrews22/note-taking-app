export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  isPublic: boolean;
  lastEdited: number;
  userId: string;
}

export interface Todo {
  id: string;
  title: string;
  content?: string;
  start: Date | null;
  end: Date | null;
  status: string;
  importance: number;
  category: string;
  userId: string;
}

export interface CalendarItem {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  category: string;
  description?: string;
  location?: string;
  userId: string;
  lastEdited: number;
}

export interface UserData {
  notes: Note[];
  todos: Todo[];
  calendarItems: CalendarItem[];
}

export function fetchUserData(userId: string): Promise<UserData>;

export function saveNote(userId: string, noteId: string | null, noteData: Partial<Note>): Promise<string>;

export function saveTodo(userId: string, todoId: string | null, todoData: Partial<Todo>): Promise<string>;

export function saveTodoItem(userId: string, todoId: string | null, todoData: Partial<Todo>): Promise<string>;

export function saveCalendarItem(userId: string, itemId: string | null, itemData: Partial<CalendarItem>): Promise<string>;

export function deleteNote(userId: string, noteId: string): Promise<void>;

export function deleteTodo(userId: string, todoId: string): Promise<void>;

export function deleteTodoItem(userId: string, todoId: string): Promise<void>;

export function deleteCalendarItem(userId: string, itemId: string): Promise<void>;

export function isUserAdmin(userId: string): Promise<boolean>;