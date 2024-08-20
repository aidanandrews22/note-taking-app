import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDataContext } from '../../context/DataContext';
import { saveCalendarItem, fetchUserData } from '../../services/DataService';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';

const CalendarItemForm = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { calendarItems, updateCalendarItems } = useDataContext();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    start: '',
    end: '',
    allDay: false,
    category: '',
    location: '',
    description: '',
    reminder: '',
    frequency: 'none',
    priority: 'medium',
    status: 'confirmed'
  });

  useEffect(() => {
    if (itemId && itemId !== 'new') {
      const item = calendarItems.find(item => item.id === itemId);
      if (item) {
        setFormData({
          ...item,
          start: item.start.toISOString().slice(0, 16),
          end: item.end.toISOString().slice(0, 16)
        });
      }
    }
  }, [itemId, calendarItems]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await saveCalendarItem(user.uid, itemId === 'new' ? null : itemId, {
        ...formData,
        start: new Date(formData.start),
        end: new Date(formData.end)
      });
      const { calendarItems: updatedCalendarItems } = await fetchUserData(user.uid);
      updateCalendarItems(updatedCalendarItems);
      navigate('/calendar');
    } catch (error) {
      console.error('Error saving calendar item:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="label">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="input"
          required
        />
      </div>
      <div className="flex space-x-4">
        <div className="flex-1">
          <label htmlFor="start" className="label">Start</label>
          <div className="relative">
            <input
              type="datetime-local"
              id="start"
              name="start"
              value={formData.start}
              onChange={handleChange}
              className="input pl-10"
              required
            />
            <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
        <div className="flex-1">
          <label htmlFor="end" className="label">End</label>
          <div className="relative">
            <input
              type="datetime-local"
              id="end"
              name="end"
              value={formData.end}
              onChange={handleChange}
              className="input pl-10"
              required
            />
            <Clock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
      </div>
      <div>
        <label className="label flex items-center">
          <input
            type="checkbox"
            name="allDay"
            checked={formData.allDay}
            onChange={handleChange}
            className="mr-2"
          />
          All-day event
        </label>
      </div>
      <div>
        <label htmlFor="category" className="label">Category</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="input"
        >
          <option value="">Select a category</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="School">School</option>
        </select>
      </div>
      <div>
        <label htmlFor="location" className="label">Location</label>
        <div className="relative">
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="input pl-10"
          />
          <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>
      <div>
        <label htmlFor="description" className="label">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="input"
          rows="3"
        ></textarea>
      </div>
      <div>
        <label htmlFor="reminder" className="label">Reminder</label>
        <div className="relative">
          <select
            id="reminder"
            name="reminder"
            value={formData.reminder}
            onChange={handleChange}
            className="input pl-10"
          >
            <option value="">No reminder</option>
            <option value="15">15 minutes before</option>
            <option value="30">30 minutes before</option>
            <option value="60">1 hour before</option>
            <option value="1440">1 day before</option>
          </select>
          <AlertCircle className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>
      <div>
        <label htmlFor="frequency" className="label">Frequency</label>
        <select
          id="frequency"
          name="frequency"
          value={formData.frequency}
          onChange={handleChange}
          className="input"
        >
          <option value="none">Does not repeat</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
      <div>
        <label htmlFor="priority" className="label">Priority</label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="input"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div>
        <label htmlFor="status" className="label">Status</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="input"
        >
          <option value="confirmed">Confirmed</option>
          <option value="tentative">Tentative</option>
          <option value="canceled">Canceled</option>
        </select>
      </div>
      <div className="flex justify-between">
        <button type="button" onClick={() => navigate('/calendar')} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {itemId === 'new' ? 'Create' : 'Update'} Calendar Item
        </button>
      </div>
    </form>
  );
};

export default CalendarItemForm;