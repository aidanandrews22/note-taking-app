import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import { useDataContext } from '../../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { Filter, PlusCircle, Calendar as CalendarIcon, CheckSquare, X, Edit2 } from 'lucide-react';
import { saveCalendarItem, saveTodoItem, fetchUserData, deleteCalendarItem } from '../../services/DataService';
import { useAuth } from '../../context/AuthContext';
import CalendarItemForm from './CalendarItemForm';
import CalendarItemView from './CalendarItemView';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const eventColors = {
  'Work': '#3174ad',
  'Personal': '#59a14f',
  'School': '#ff7f0e',
  'Todo': '#8e44ad',
};

const CalendarView = () => {
  const { calendarItems, todoItems, loading, error, updateCalendarItems, updateTodos } = useDataContext();
  const [showCompleted, setShowCompleted] = useState(true);
  const [view, setView] = useState('week');
  const [showCalendarItemForm, setShowCalendarItemForm] = useState(false);
  const [selectedEventForEdit, setSelectedEventForEdit] = useState(null);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const navigate = useNavigate();
  const { user } = useAuth();

  const expandRecurringEvents = (event) => {
    if (!event.recurrence || event.recurrence.frequency === 'none') {
      return [event];
    }
  
    const expandedEvents = [];
    let currentDate = moment(event.start).startOf('day');
    const eventDuration = moment(event.end).diff(moment(event.start));
    const recurrenceStart = event.recurrence.start ? moment(event.recurrence.start).startOf('day') : currentDate;
    const recurrenceEnd = event.recurrence.endDate ? moment(event.recurrence.endDate).endOf('day') : moment().add(1, 'year').endOf('day');
    const blackoutDates = (event.recurrence.blackoutDates || []).map(date => moment(date).startOf('day'));
  
    while (currentDate.isSameOrBefore(recurrenceEnd)) {
      if (currentDate.isSameOrAfter(recurrenceStart)) {
        const isBlackoutDate = blackoutDates.some(date => date.isSame(currentDate, 'day'));
        
        if (!isBlackoutDate) {
          if (event.recurrence.frequency === 'day' || 
              (event.recurrence.frequency === 'week' && event.recurrence.weekdays.includes(currentDate.format('ddd')))) {
            expandedEvents.push(createEventInstance(event, currentDate, eventDuration));
          } else if (event.recurrence.frequency === 'month' && currentDate.date() === moment(event.start).date()) {
            expandedEvents.push(createEventInstance(event, currentDate, eventDuration));
          } else if (event.recurrence.frequency === 'year' && 
                     currentDate.month() === moment(event.start).month() && 
                     currentDate.date() === moment(event.start).date()) {
            expandedEvents.push(createEventInstance(event, currentDate, eventDuration));
          }
        }
      }
  
      currentDate.add(event.recurrence.interval, event.recurrence.frequency === 'week' ? 'days' : event.recurrence.frequency);
    }
  
    return expandedEvents;
  };
  
  const createEventInstance = (event, date, duration) => ({
    ...event,
    start: date.hour(moment(event.start).hour()).minute(moment(event.start).minute()).toDate(),
    end: date.hour(moment(event.start).hour()).minute(moment(event.start).minute()).add(duration).toDate(),
    isRecurring: true,
  });

  const events = useMemo(() => {
    const calendarEvents = (calendarItems || []).flatMap(item => {
      const expandedEvents = expandRecurringEvents({
        ...item,
        start: new Date(item.start),
        end: new Date(item.end),
        resource: {
          type: 'calendarItem',
          ...item
        },
        recurrence: item.recurrence ? {
          ...item.recurrence,
          start: item.recurrence.start ? new Date(item.recurrence.start) : undefined,
          endDate: item.recurrence.endDate ? new Date(item.recurrence.endDate) : undefined,
          blackoutDates: item.recurrence.blackoutDates || []
        } : undefined
      });
      return expandedEvents;
    });
  
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
          ...item
        }
      }));
  
    return [...calendarEvents, ...todoEvents];
  }, [calendarItems, todoItems, showCompleted]);

  const eventStyleGetter = useCallback((event) => {
    const baseStyle = {
      backgroundColor: '#4183C4',
      borderRadius: '3px',
      opacity: 0.8,
      color: 'white',
      border: 'none',
      display: 'block'
    };
  
    if (event && event.resource) {
      if (event.resource.type === 'todoItem') {
        baseStyle.backgroundColor = eventColors.Todo;
      } else if (event.resource.category && eventColors[event.resource.category]) {
        baseStyle.backgroundColor = eventColors[event.resource.category];
      }
  
      if (event.resource.status === 'canceled' || event.resource.status === 'completed') {
        baseStyle.opacity = 0.5;
      }
  
      if (event.resource.status === 'tentative') {
        baseStyle.borderStyle = 'dashed';
      }
  
      if (event.resource.priority === 'high' || event.resource.importance === 2) {
        baseStyle.borderLeft = '5px solid #e74c3c';
      }
    }
  
    return { style: baseStyle };
  }, []);

  const onEventDrop = useCallback(
    async ({ event, start, end, isAllDay: droppedOnAllDaySlot = false }) => {
      const { id, resource } = event;
      let updatedEvent;

      if (resource.type === 'calendarItem') {
        updatedEvent = {
          ...resource,
          start: start.toISOString(),
          end: (end || start).toISOString(),
          allDay: droppedOnAllDaySlot
        };
        try {
          await saveCalendarItem(user.uid, id, updatedEvent);
        } catch (error) {
          console.error('Error saving dropped calendar item:', error);
          return;
        }
      } else if (resource.type === 'todoItem') {
        updatedEvent = {
          ...resource,
          dueDate: start.toISOString(),
          allDay: droppedOnAllDaySlot
        };
        try {
          await saveTodoItem(user.uid, id, updatedEvent);
        } catch (error) {
          console.error('Error saving dropped todo item:', error);
          return;
        }
      }

      try {
        const { calendarItems: updatedCalendarItems, todoItems: updatedTodoItems } = await fetchUserData(user.uid);
        updateCalendarItems(updatedCalendarItems);
        updateTodos(updatedTodoItems);
      } catch (error) {
        console.error('Error fetching updated data after drop:', error);
      }
    },
    [user.uid, updateCalendarItems, updateTodos]
  );

  const onEventResize = useCallback(
    async ({ event, start, end }) => {
      const { id, resource } = event;

      if (resource.type === 'calendarItem') {
        const updatedEvent = {
          ...resource,
          start: start.toISOString(),
          end: end.toISOString(),
          allDay: false
        };
        try {
          await saveCalendarItem(user.uid, id, updatedEvent);
          const { calendarItems: updatedCalendarItems } = await fetchUserData(user.uid);
          updateCalendarItems(updatedCalendarItems);
        } catch (error) {
          console.error('Error saving resized calendar item:', error);
        }
      }
    },
    [user.uid, updateCalendarItems]
  );

  const handleCreateNewEvent = useCallback(({ start, end }) => {
    setSelectedEventForEdit({
      start: start,
      end: end || moment(start).add(1, 'hour').toDate(),
      allDay: false,
    });
    setShowCalendarItemForm(true);
  }, []);


  const handleEventClick = useCallback((event, e) => {
    const { clientX, clientY } = e;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const popupWidth = 300; // Adjust based on your popup width
    const popupHeight = 200; // Adjust based on your popup height
  
    let top = clientY;
    let left = clientX;
  
    // Ensure the popup stays within the screen boundaries
    if (left + popupWidth > windowWidth) {
      left = windowWidth - popupWidth - 10;
    }
    if (top + popupHeight > windowHeight) {
      top = windowHeight - popupHeight - 10;
    }
  
    setPopupPosition({ top, left });
    setSelectedEvent({
      ...event.resource,
      currentInstanceDate: moment(event.start).format('YYYY-MM-DD')
    });
  setShowPopup(true);
}, []);

  const handlePopupClose = () => {
    setShowPopup(false);
    setSelectedEvent(null);
  };

  const handleViewDetails = () => {
    setShowPopup(false);
    setShowEventDetailsModal(true);
  };

  const handleEditEvent = () => {
    setShowPopup(false);
    setShowEventDetailsModal(false);
    setSelectedEventForEdit(selectedEvent);
    setShowCalendarItemForm(true);
  };

  const handleCloseEventDetails = () => {
    setShowEventDetailsModal(false);
    setSelectedEvent(null);
  };

  const handleCloseForm = () => {
    setShowCalendarItemForm(false);
    setSelectedEventForEdit(null);
  };

  const handleSaveCalendarItem = async (eventData) => {
    try {
      await saveCalendarItem(user.uid, eventData.id || null, eventData);
      const { calendarItems: updatedCalendarItems } = await fetchUserData(user.uid);
      updateCalendarItems(updatedCalendarItems);
      handleCloseForm();
    } catch (error) {
      console.error('Error saving calendar item:', error);
    }
  };

  const handleDeleteEvent = async (eventId, deleteType) => {
    const confirmMessage = deleteType === 'series' 
      ? 'Are you sure you want to delete this entire series?' 
      : 'Are you sure you want to delete this event?';
  
    if (window.confirm(confirmMessage)) {
      try {
        await deleteCalendarItem(user.uid, eventId, deleteType);
        const { calendarItems: updatedCalendarItems } = await fetchUserData(user.uid);
        updateCalendarItems(updatedCalendarItems);
        setShowEventDetailsModal(false);
        setShowPopup(false);
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const onViewChange = useCallback((newView) => {
    setView(newView);
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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
          <button 
            onClick={handleCreateNewEvent} 
            className="btn btn-primary flex items-center"
          >
            <PlusCircle className="mr-2" size={18} />
            New Event
          </button>
        </div>
      </div>
      
      <div className="mb-4 flex flex-wrap gap-4">
        {Object.entries(eventColors).map(([category, color]) => (
          <div key={category} className="flex items-center">
            <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: color }}></div>
            <span>{category}</span>
          </div>
        ))}
        <div className="flex items-center" title="High Priority">
          <div className="w-4 h-4 border-l-4 border-red-500 mr-2"></div>
          <span>High Priority</span>
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
          onSelectSlot={handleCreateNewEvent}
          onView={onViewChange}
          selectable
          resizable
          views={['month', 'week', 'day', 'agenda']}
          defaultView={view}
          tooltipAccessor={(event) => event.title}
          components={{
            event: EventComponent,
            agenda: {
              event: AgendaEventComponent,
            },
          }}
          step={15} // 30 minutes between slots
          timeslots={2} // 2 slots per step (increases space)
          scrollToTime={moment().hours(7).minutes(30).toDate()}
        />
      </div>


      {showPopup && selectedEvent && (
        <div 
          className="fixed bg-white p-4 rounded-lg shadow-lg z-50"
          style={{ top: popupPosition.top, left: popupPosition.left }}
        >
          <h3 className="text-lg font-semibold mb-2">{selectedEvent.title}</h3>
          <p>{moment(selectedEvent.start).format('MMMM D, YYYY @ h:mm')} - {moment(selectedEvent.end).format('h:mm A')}</p>
          {selectedEvent.location && <p>Location: {selectedEvent.location}</p>}
          {selectedEvent.description && (
            <p className="mt-2">
              Description: {selectedEvent.description.length > 100 
                ? `${selectedEvent.description.substring(0, 100)}...` 
                : selectedEvent.description}
            </p>
          )}
          <div className="mt-4 flex justify-between">
            <button onClick={handleViewDetails} className="btn btn-secondary">
              View Details
            </button>
            <button onClick={handleEditEvent} className="btn btn-primary">
              <Edit2 size={18} className="mr-1" /> Edit
            </button>
          </div>
          <button 
            onClick={handlePopupClose} 
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {showCalendarItemForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedEventForEdit && selectedEventForEdit.id ? 'Edit Event' : 'Create New Event'}
              </h3>
              <button onClick={() => {
                setShowCalendarItemForm(false);
                setSelectedEventForEdit(null);
              }} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <CalendarItemForm
              initialData={selectedEventForEdit}
              onSave={handleSaveCalendarItem}
              onCancel={() => {
                setShowCalendarItemForm(false);
                setSelectedEventForEdit(null);
              }}
              onDelete={handleDeleteEvent}
              currentInstanceDate={selectedEventForEdit?.currentInstanceDate}
            />
          </div>
        </div>
      )}

      {showEventDetailsModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <CalendarItemView
            itemId={selectedEvent.id}
            onClose={() => setShowEventDetailsModal(false)}
            onEdit={handleEditEvent}
            currentInstanceDate={selectedEvent.currentInstanceDate}
          />
        </div>
      )}
    </div>
  );
};

const EventComponent = ({ event }) => {
  return (
    <div className="flex items-center">
      <span className="mr-1">
        {event.resource.type === 'calendarItem' ? '📅' : '✅'}
      </span>
      <span className="truncate">{event.title}</span>
    </div>
  );
};

const AgendaEventComponent = ({ event }) => {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center">
        <span className="mr-2">
          {event.resource.type === 'calendarItem' ? '📅' : '✅'}
        </span>
        <span className="truncate">{event.title}</span>
      </div>
      <div className="text-sm text-gray-500">
        {event.resource.category || 'Todo'}
      </div>
    </div>
  );
};

// const NewEventModal = ({ onClose, onSubmit, initialStart, initialEnd }) => {
//   const [eventData, setEventData] = useState({
//     title: '',
//     start: initialStart,
//     end: initialEnd,
//     allDay: false,
//     type: 'calendar', // 'calendar' or 'todo'
//     category: 'Personal',
//     description: '',
//     priority: 'medium',
//     status: 'confirmed',
//     recurrence: 'none',
//     recurrenceInterval: 1,
//     recurrenceEndDate: null,
//   });

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setEventData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSubmit(eventData);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//       <div className="bg-white p-6 rounded-lg max-w-2xl w-full overflow-y-auto">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-lg font-semibold">Create New Event</h3>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             <X size={24} />
//           </button>
//         </div>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input
//             type="text"
//             name="title"
//             value={eventData.title}
//             onChange={handleChange}
//             placeholder="Event Title"
//             className="w-full p-2 border rounded"
//             required
//           />
//           <div className="flex space-x-2">
//             <div className="flex-1">
//               <label className="block text-sm font-medium text-gray-700">Start</label>
//               <input
//                 type="datetime-local"
//                 name="start"
//                 value={moment(eventData.start).format('YYYY-MM-DDTHH:mm')}
//                 onChange={handleChange}
//                 className="w-full p-2 border rounded"
//                 required
//               />
//             </div>
//             <div className="flex-1">
//               <label className="block text-sm font-medium text-gray-700">End</label>
//               <input
//                 type="datetime-local"
//                 name="end"
//                 value={moment(eventData.end).format('YYYY-MM-DDTHH:mm')}
//                 onChange={handleChange}
//                 className="w-full p-2 border rounded"
//                 required
//               />
//             </div>
//           </div>
//           <label className="flex items-center">
//             <input
//               type="checkbox"
//               name="allDay"
//               checked={eventData.allDay}
//               onChange={handleChange}
//               className="mr-2"
//             />
//             All Day Event
//           </label>
//           <select
//             name="type"
//             value={eventData.type}
//             onChange={handleChange}
//             className="w-full p-2 border rounded"
//           >
//             <option value="calendar">Calendar Event</option>
//             <option value="todo">Todo Item</option>
//           </select>
//           <select
//             name="category"
//             value={eventData.category}
//             onChange={handleChange}
//             className="w-full p-2 border rounded"
//           >
//             <option value="Personal">Personal</option>
//             <option value="Work">Work</option>
//             <option value="School">School</option>
//           </select>
//           <textarea
//             name="description"
//             value={eventData.description}
//             onChange={handleChange}
//             placeholder="Description"
//             className="w-full p-2 border rounded"
//             rows="3"
//           ></textarea>
//           <select
//             name="priority"
//             value={eventData.priority}
//             onChange={handleChange}
//             className="w-full p-2 border rounded"
//           >
//             <option value="low">Low</option>
//             <option value="medium">Medium</option>
//             <option value="high">High</option>
//           </select>
//           <select
//             name="status"
//             value={eventData.status}
//             onChange={handleChange}
//             className="w-full p-2 border rounded"
//           >
//             <option value="confirmed">Confirmed</option>
//             <option value="tentative">Tentative</option>
//             <option value="canceled">Canceled</option>
//           </select>
//           <select
//             name="recurrence"
//             value={eventData.recurrence}
//             onChange={handleChange}
//             className="w-full p-2 border rounded"
//           >
//             <option value="none">Does not repeat</option>
//             <option value="daily">Daily</option>
//             <option value="weekly">Weekly</option>
//             <option value="monthly">Monthly</option>
//             <option value="yearly">Yearly</option>
//           </select>
//           {eventData.recurrence !== 'none' && (
//             <>
//               <input
//                 type="number"
//                 name="recurrenceInterval"
//                 value={eventData.recurrenceInterval}
//                 onChange={handleChange}
//                 min="1"
//                 className="w-full p-2 border rounded"
//                 placeholder="Repeat every X days/weeks/months/years"
//               />
//               <input
//                 type="date"
//                 name="recurrenceEndDate"
//                 value={eventData.recurrenceEndDate || ''}
//                 onChange={handleChange}
//                 className="w-full p-2 border rounded"
//                 placeholder="End date (optional)"
//               />
//             </>
//           )}
//           <div className="flex justify-end space-x-2">
//             <button type="button" onClick={onClose} className="btn btn-secondary">
//               Cancel
//             </button>
//             <button type="submit" className="btn btn-primary">
//               Create Event
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// const EventDetailsModal = ({ event, onClose, onDelete }) => {
//   const isRecurring = event.resource.recurrence !== 'none';

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//       <div className="bg-white p-6 rounded-lg max-w-md w-full">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-lg font-semibold">{event.title}</h3>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             <X size={24} />
//           </button>
//         </div>
//         <div className="space-y-4">
//           <div>
//             <span className="font-semibold">Start:</span> {moment(event.start).format('MMMM D, YYYY h:mm A')}
//           </div>
//           <div>
//             <span className="font-semibold">End:</span> {moment(event.end).format('MMMM D, YYYY h:mm A')}
//           </div>
//           {event.resource.allDay && (
//             <div>
//               <span className="font-semibold">All Day Event</span>
//             </div>
//           )}
//           <div>
//             <span className="font-semibold">Category:</span> {event.resource.category}
//           </div>
//           {event.resource.description && (
//             <div>
//               <span className="font-semibold">Description:</span>
//               <p className="mt-1">{event.resource.description}</p>
//             </div>
//           )}
//           <div>
//             <span className="font-semibold">Priority:</span> {event.resource.priority}
//           </div>
//           <div>
//             <span className="font-semibold">Status:</span> {event.resource.status}
//           </div>
//           {isRecurring && (
//             <div>
//               <span className="font-semibold">Recurrence:</span> {event.resource.recurrence}
//               {event.resource.recurrenceInterval > 1 && ` (every ${event.resource.recurrenceInterval} ${event.resource.recurrence}s)`}
//               {event.resource.recurrenceEndDate && ` until ${moment(event.resource.recurrenceEndDate).format('MMMM D, YYYY')}`}
//             </div>
//           )}
//         </div>
//         <div className="mt-6 flex justify-end space-x-2">
//           <button 
//             onClick={() => onDelete(event.id, isRecurring)} 
//             className="btn btn-danger flex items-center"
//           >
//             <Trash2 size={18} className="mr-2" />
//             Delete {isRecurring ? 'Series' : 'Event'}
//           </button>
//           <button onClick={onClose} className="btn btn-secondary">
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

export default CalendarView;