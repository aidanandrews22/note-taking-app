import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDataContext } from '../../context/DataContext';
import { saveCalendarItem, deleteCalendarItem, fetchUserData } from '../../services/DataService';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, MapPin, AlertCircle, RepeatIcon, Flag, CheckCircle, Edit2, Trash2 } from 'lucide-react';
import moment from 'moment';

const CalendarItemView = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { calendarItems, updateCalendarItems } = useDataContext();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const foundItem = calendarItems.find(i => i.id === itemId);
    if (foundItem) {
      setItem(foundItem);
    } else {
      navigate('/calendar');
    }
  }, [itemId, calendarItems, navigate]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async (updatedItem) => {
    try {
      await saveCalendarItem(user.uid, itemId, updatedItem);
      const { calendarItems: updatedCalendarItems } = await fetchUserData(user.uid);
      updateCalendarItems(updatedCalendarItems);
      setItem(updatedItem);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating calendar item:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteCalendarItem(user.uid, itemId);
        const { calendarItems: updatedCalendarItems } = await fetchUserData(user.uid);
        updateCalendarItems(updatedCalendarItems);
        navigate('/calendar');
      } catch (error) {
        console.error('Error deleting calendar item:', error);
      }
    }
  };

  if (!item) {
    return <div>Loading...</div>;
  }

  return (
    <div className="calendar-item-view">
      <Link to="/calendar" className="btn btn-secondary mb-4">&larr; Back to Calendar</Link>
      {isEditing ? (
        <CalendarItemForm item={item} onSave={handleSave} onCancel={() => setIsEditing(false)} />
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{item.title}</h2>
            <div>
              <button onClick={handleEdit} className="btn btn-primary mr-2">
                <Edit2 size={18} className="mr-1" /> Edit
              </button>
              <button onClick={handleDelete} className="btn btn-danger">
                <Trash2 size={18} className="mr-1" /> Delete
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center">
              <Calendar className="mr-2" size={20} />
              <span>{moment(item.start).format('MMMM D, YYYY')}</span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-2" size={20} />
              <span>
                {item.allDay 
                  ? 'All Day' 
                  : `${moment(item.start).format('h:mm A')} - ${moment(item.end).format('h:mm A')}`}
              </span>
            </div>
            {item.location && (
              <div className="flex items-center">
                <MapPin className="mr-2" size={20} />
                <span>{item.location}</span>
              </div>
            )}
            {item.category && (
              <div className="flex items-center">
                <span className="mr-2 px-2 py-1 bg-gray-200 rounded-full text-sm">{item.category}</span>
              </div>
            )}
            {item.description && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Description</h3>
                <p>{item.description}</p>
              </div>
            )}
            {item.reminder && (
              <div className="flex items-center">
                <AlertCircle className="mr-2" size={20} />
                <span>Reminder: {item.reminder} minutes before</span>
              </div>
            )}
            {item.frequency !== 'none' && (
              <div className="flex items-center">
                <RepeatIcon className="mr-2" size={20} />
                <span>Repeats: {item.frequency}</span>
              </div>
            )}
            <div className="flex items-center">
              <Flag className={`mr-2 text-${item.priority}-500`} size={20} />
              <span>Priority: {item.priority}</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className={`mr-2 text-${item.status === 'confirmed' ? 'green' : item.status === 'tentative' ? 'yellow' : 'red'}-500`} size={20} />
              <span>Status: {item.status}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CalendarItemForm = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState(item);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        placeholder="Event Title"
        required
      />
      <div className="flex space-x-4">
        <input
          type="datetime-local"
          name="start"
          value={moment(formData.start).format('YYYY-MM-DDTHH:mm')}
          onChange={handleChange}
          className="w-1/2 p-2 border rounded"
          required
        />
        <input
          type="datetime-local"
          name="end"
          value={moment(formData.end).format('YYYY-MM-DDTHH:mm')}
          onChange={handleChange}
          className="w-1/2 p-2 border rounded"
          required
        />
      </div>
      <label className="flex items-center">
        <input
          type="checkbox"
          name="allDay"
          checked={formData.allDay}
          onChange={handleChange}
          className="mr-2"
        />
        All Day Event
      </label>
      <input
        type="text"
        name="location"
        value={formData.location}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        placeholder="Location"
      />
      <select
        name="category"
        value={formData.category}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option value="">Select Category</option>
        <option value="Work">Work</option>
        <option value="Personal">Personal</option>
        <option value="School">School</option>
      </select>
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        placeholder="Description"
        rows="3"
      ></textarea>
      <select
        name="reminder"
        value={formData.reminder}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option value="">No Reminder</option>
        <option value="5">5 minutes before</option>
        <option value="15">15 minutes before</option>
        <option value="30">30 minutes before</option>
        <option value="60">1 hour before</option>
      </select>
      <select
        name="frequency"
        value={formData.frequency}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option value="none">Does not repeat</option>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </select>
      <select
        name="priority"
        value={formData.priority}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option value="confirmed">Confirmed</option>
        <option value="tentative">Tentative</option>
        <option value="canceled">Canceled</option>
      </select>
      <div className="flex justify-between">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default CalendarItemView;