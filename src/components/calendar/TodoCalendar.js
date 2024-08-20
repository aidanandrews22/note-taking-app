import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import { useDataContext } from '../../context/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import { Filter, PlusCircle, Calendar as CalendarIcon, CheckSquare } from 'lucide-react';
import { saveCalendarItem, saveTodoItem, fetchUserData } from '../../services/DataService';
import { useAuth } from '../../context/AuthContext';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const eventColors = {
  'calendarItem': '#3174ad',
  'todoItem': '#59a14f',
  'completed': '#8idl8e',
};

const TodoCalendar = () => {
  const { calendarItems, todoItems, loading, error, updateCalendarItems, updateTodoItems } = useDataContext();
  const [showCompleted, setShowCompleted] = useState(true);
  const navigate = useNavigate();
  const [view, setView] = useState('month');
  const { user } = useAuth();

  console.log('CalendarItems in TodoCalendar:', calendarItems);
  console.log('TodoItems in TodoCalendar:', todoItems);

  const events = useMemo(() => {
    const calendarEvents = (calendarItems || []).map(item => ({
      id: item.id,
      title: item.title,
      start: new Date(item.start),
      end: new Date(item.end),
      allDay: item.allDay,
      resource: {
        type: 'calendarItem',
        status: item.status,
        category: item.category
      }
    }));

    const todoEvents = (todoItems || [])
      .filter(item => showCompleted || item.status !== 'completed')
      .map(item => ({
        id: item.id,
        title: item.title,
        start: new Date(item.dueDate),
        end: new Date(item.dueDate),
        allDay: true,
        resource: {
          type: 'todoItem',
          status: item.status,
          importance: item.importance
        }
      }));

    return [...calendarEvents, ...todoEvents];
  }, [calendarItems, todoItems, showCompleted]);

  const handleEventClick = useCallback((event) => {
    if (event.resource.type === 'calendarItem') {
      navigate(`/calendar/${event.id}`);
    } else {
      navigate(`/todos/${event.id}`);
    }
  }, [navigate]);

  const eventStyleGetter = useCallback((event) => {
    const style = {
      backgroundColor: eventColors[event.resource.type],
      opacity: event.resource.status === 'completed' ? 0.5 : 1,
      color: '#fff',
      border: 'none',
      display: 'block'
    };

    if (event.resource.type === 'todoItem') {
      style.backgroundColor = eventColors[event.resource.status === 'completed' ? 'completed' : 'todoItem'];
    }

    return { style };
  }, []);

  const onEventDrop = useCallback(
    async ({ event, start, end, allDay }) => {
      if (event.resource.type === 'calendarItem') {
        const updatedItem = calendarItems.find(item => item.id === event.id);
        if (updatedItem) {
          const newItem = { ...updatedItem, start, end, allDay };
          await saveCalendarItem(user.uid, event.id, newItem);
          const { calendarItems: updatedCalendarItems } = await fetchUserData(user.uid);
          updateCalendarItems(updatedCalendarItems);
        }
      } else {
        const updatedItem = todoItems.find(item => item.id === event.id);
        if (updatedItem) {
          const newItem = { ...updatedItem, dueDate: start };
          await saveTodoItem(user.uid, event.id, newItem);
          const { todoItems: updatedTodoItems } = await fetchUserData(user.uid);
          updateTodoItems(updatedTodoItems);
        }
      }
    },
    [calendarItems, todoItems, user.uid, updateCalendarItems, updateTodoItems]
  );
  
  const onSelectSlot = useCallback(
    async ({ start, end }) => {
      const isCalendarItem = window.confirm('Create a calendar event? Click Cancel to create a todo item instead.');
      const title = window.prompt(`Enter a title for the new ${isCalendarItem ? 'event' : 'todo'}:`);
      
      if (title) {
        if (isCalendarItem) {
          const newEvent = {
            title,
            start,
            end,
            allDay: view === 'month',
            category: 'Misc',
            status: 'confirmed'
          };
          await saveCalendarItem(user.uid, null, newEvent);
        } else {
          const newTodo = {
            title,
            dueDate: start,
            status: 'not-started',
            importance: 1,
            category: 'Misc'
          };
          await saveTodoItem(user.uid, null, newTodo);
        }
        const { calendarItems: updatedCalendarItems, todoItems: updatedTodoItems } = await fetchUserData(user.uid);
        updateCalendarItems(updatedCalendarItems);
        updateTodoItems(updatedTodoItems);
      }
    },
    [user.uid, updateCalendarItems, updateTodoItems, view]
  );

  const onViewChange = useCallback((newView) => {
    setView(newView);
  }, []);

  const onEventResize = useCallback(
    async ({ event, start, end }) => {
      if (event.resource.type === 'calendarItem') {
        const updatedItem = calendarItems.find(item => item.id === event.id);
        if (updatedItem) {
          const newItem = { ...updatedItem, start, end };
          await saveCalendarItem(user.uid, event.id, newItem);
          const { calendarItems: updatedCalendarItems } = await fetchUserData(user.uid);
          updateCalendarItems(updatedCalendarItems);
        }
      } else {
        const updatedItem = todoItems.find(item => item.id === event.id);
        if (updatedItem) {
          const newItem = { ...updatedItem, dueDate: end };
          await saveTodoItem(user.uid, event.id, newItem);
          const { todoItems: updatedTodoItems } = await fetchUserData(user.uid);
          updateTodoItems(updatedTodoItems);
        }
      }
    },
    [calendarItems, todoItems, user.uid, updateCalendarItems, updateTodoItems]
  );

  return (
    <div className="todo-calendar">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Calendar</h2>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowCompleted(!showCompleted)} 
            className="btn btn-secondary flex items-center"
          >
            <Filter className="mr-2" size={18} />
            {showCompleted ? 'Hide Completed' : 'Show Completed'}
          </button>
          <Link to="/calendar/new" className="btn btn-primary flex items-center">
            <PlusCircle className="mr-2" size={18} />
            New Event
          </Link>
          <Link to="/todos/new" className="btn btn-primary flex items-center">
            <CheckSquare className="mr-2" size={18} />
            New Todo
          </Link>
        </div>
      </div>
      <div style={{ height: 'calc(100vh - 200px)' }}>
        <DnDCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectEvent={handleEventClick}
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