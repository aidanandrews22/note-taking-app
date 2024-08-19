import React, { useState, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import { useDataContext } from '../../context/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { saveNote, saveTodo, fetchUserData } from '../../services/DataService';
import { useAuth } from '../../context/AuthContext';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const importanceColors = [
  '#E0E0E0',  // Trivial
  '#BBDEFB',  // 1
  '#C8E6C9',  // 2
  '#FFF9C4',  // 3
  '#FFCC80',  // 4
  '#FFCDD2'   // Important!
];

const TodoCalendar = () => {
  const { todos, updateNotes } = useDataContext();
  const [showCompleted, setShowCompleted] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  console.log('Todos in calendar:', todos);

  const handleTodoClick = useCallback((event) => {
    navigate(`/notes/${event.id}`);
  }, [navigate]);

  const events = todos
    .filter(todo => showCompleted || todo.status !== 'completed')
    .map(todo => ({
      id: todo.id,
      title: todo.title,
      start: new Date(todo.start),
      end: new Date(todo.end),
      allDay: false,
      resource: {
        status: todo.status,
        importance: todo.importance
      }
    }));

  const eventStyleGetter = useCallback((event) => {
    const style = {
      backgroundColor: importanceColors[event.resource.importance || 0],
      borderRadius: '5px',
      opacity: event.resource.status === 'completed' ? 0.5 : 1,
      color: '#333',
      border: 'none',
      display: 'block'
    };
    return { style };
  }, []);

  const onEventDrop = useCallback(
    async ({ event, start, end }) => {
      const updatedTodo = todos.find(todo => todo.id === event.id);
      if (updatedTodo) {
        const newTodo = { ...updatedTodo, start, end };
        await saveTodo(user.uid, event.id, newTodo);
        const { todos: updatedTodos } = await fetchUserData(user.uid);
        updateNotes(updatedTodos);
      }
    },
    [todos, user.uid, updateNotes]
  );
  
  const onEventResize = useCallback(
    async ({ event, start, end }) => {
      const updatedTodo = todos.find(todo => todo.id === event.id);
      if (updatedTodo) {
        const newTodo = { ...updatedTodo, start, end };
        await saveTodo(user.uid, event.id, newTodo);
        const { todos: updatedTodos } = await fetchUserData(user.uid);
        updateNotes(updatedTodos);
      }
    },
    [todos, user.uid, updateNotes]
  );
  
  const onSelectSlot = useCallback(
    async ({ start, end }) => {
      const title = window.prompt('New todo name');
      if (title) {
        const newTodo = {
          title,
          start,
          end,
          category: 'Todo',
          status: 'pending',
          importance: 0,
          content: '',
        };
        await saveTodo(user.uid, null, newTodo);
        const { todos: updatedTodos } = await fetchUserData(user.uid);
        updateNotes(updatedTodos);
      }
    },
    [user.uid, updateNotes]
  );

  return (
    <div className="todo-calendar">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Todo Calendar</h2>
        <div className="flex items-center">
          <button 
            onClick={() => setShowCompleted(!showCompleted)} 
            className="btn btn-secondary flex items-center mr-2"
          >
            <Filter className="mr-2" size={18} />
            {showCompleted ? 'Hide Completed' : 'Show Completed'}
          </button>
          <Link to="/todos" className="btn btn-secondary">Back to Todos</Link>
        </div>
      </div>
      <div style={{ height: 'calc(100vh - 200px)' }}>
        <DnDCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectEvent={handleTodoClick}
          eventPropGetter={eventStyleGetter}
          onEventDrop={onEventDrop}
          onEventResize={onEventResize}
          onSelectSlot={onSelectSlot}
          selectable
          resizable
        />
      </div>
    </div>
  );
};

export default TodoCalendar;