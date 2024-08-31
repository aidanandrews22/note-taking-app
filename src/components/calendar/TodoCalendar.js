import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import { useDataContext } from '../../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { Filter, PlusCircle, Calendar as CalendarIcon, CheckSquare, X, Edit2 } from 'lucide-react';
import { saveTodoItem, fetchUserData } from '../../services/DataService';
import { useAuth } from '../../context/AuthContext';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const eventColors = {
  'not-started': '#3174ad',
  'in-progress': '#59a14f',
  'completed': '#ff7f0e',
};

const TodoCalendar = () => {
  const { todos, loading, error, updateTodos } = useDataContext();
  const [showCompleted, setShowCompleted] = useState(true);
  const [view, setView] = useState('month');
  const [selectedTodo, setSelectedTodo] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const events = useMemo(() => {
    return todos.filter(todo => showCompleted || todo.status !== 'completed').map(todo => ({
      id: todo.id,
      title: todo.title,
      start: new Date(todo.dueDate),
      end: new Date(todo.dueDate),
      allDay: true,
      resource: todo,
    }));
  }, [todos, showCompleted]);

  const eventStyleGetter = useCallback((event) => {
    const style = {
      backgroundColor: eventColors[event.resource.status],
      borderRadius: '3px',
      opacity: 0.8,
      color: 'white',
      border: 'none',
      display: 'block',
    };
    return { style };
  }, []);

  const onEventDrop = useCallback(
    async ({ event, start, end }) => {
      const updatedTodo = {
        ...event.resource,
        dueDate: start.toISOString(),
      };
      try {
        await saveTodoItem(user.uid, event.id, updatedTodo);
        const { todos: updatedTodos } = await fetchUserData(user.uid);
        updateTodos(updatedTodos);
      } catch (error) {
        console.error('Error updating todo date:', error);
      }
    },
    [user.uid, updateTodos]
  );

  const handleSelectEvent = (event) => {
    setSelectedTodo(event.resource);
  };

  const handleClosePopup = () => {
    setSelectedTodo(null);
  };

  const handleEditTodo = () => {
    navigate(`/todos/${selectedTodo.id}`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="todo-calendar">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Todo Calendar</h2>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowCompleted(!showCompleted)} 
            className="btn btn-secondary flex items-center"
          >
            <Filter className="mr-2" size={18} />
            {showCompleted ? 'Hide Completed' : 'Show Completed'}
          </button>
          <button 
            onClick={() => navigate('/todos/new')} 
            className="btn btn-primary flex items-center"
          >
            <PlusCircle className="mr-2" size={18} />
            New Todo
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-4">
        {Object.entries(eventColors).map(([status, color]) => (
          <div key={status} className="flex items-center">
            <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: color }}></div>
            <span className="capitalize">{status.replace('-', ' ')}</span>
          </div>
        ))}
      </div>

      <div style={{ height: 'calc(100vh - 200px)' }}>
        <DnDCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          onEventDrop={onEventDrop}
          resizable={false}
          selectable
          views={['month', 'week', 'day', 'agenda']}
          defaultView={view}
          onView={setView}
          tooltipAccessor={(event) => event.title}
          components={{
            event: EventComponent,
          }}
          popup
          step={60}
          timeslots={1}
        />
      </div>

      {selectedTodo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{selectedTodo.title}</h3>
              <button onClick={handleClosePopup} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <p><strong>Due Date:</strong> {moment(selectedTodo.dueDate).format('MMMM D, YYYY')}</p>
            <p><strong>Status:</strong> {selectedTodo.status}</p>
            <p><strong>Description:</strong> {selectedTodo.description || 'No description'}</p>
            <div className="mt-4 flex justify-end">
              <button onClick={handleEditTodo} className="btn btn-primary">
                <Edit2 size={18} className="mr-2" /> Edit Todo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EventComponent = ({ event }) => {
  return (
    <div className="flex items-center">
      <CheckSquare size={14} className="mr-1" />
      <span className="truncate">{event.title}</span>
    </div>
  );
};

export default TodoCalendar;