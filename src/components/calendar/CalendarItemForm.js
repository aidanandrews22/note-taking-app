import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Calendar, Clock, MapPin, AlertCircle, RepeatIcon, Flag, CheckCircle, Bell } from 'lucide-react';

const CalendarItemForm = ({ initialData, onSave, onCancel, onDelete, currentInstanceDate }) => {
  const [formData, setFormData] = useState({
    title: '',
    start: moment().format('YYYY-MM-DDTHH:mm'),
    end: moment().add(1, 'hour').format('YYYY-MM-DDTHH:mm'),
    allDay: false,
    category: '',
    location: '',
    description: '',
    notification: '',
    recurrence: {
      frequency: 'none',
      interval: 1,
      weekdays: [],
      endDate: null,
    },
    priority: 'medium',
    status: 'confirmed'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        start: moment(initialData.start).format('YYYY-MM-DDTHH:mm'),
        end: moment(initialData.end).format('YYYY-MM-DDTHH:mm'),
        recurrence: {
          ...initialData.recurrence,
          endDate: initialData.recurrence && initialData.recurrence.endDate
            ? moment(initialData.recurrence.endDate).format('YYYY-MM-DD')
            : null,
        }
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'start') {
      const endTime = moment(value).add(1, 'hour').format('YYYY-MM-DDTHH:mm');
      setFormData(prev => ({
        ...prev,
        [name]: value,
        end: endTime
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleRecurrenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      recurrence: {
        ...prev.recurrence,
        [name]: type === 'checkbox' 
          ? (checked 
            ? [...prev.recurrence.weekdays, value]
            : prev.recurrence.weekdays.filter(day => day !== value))
          : value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      start: new Date(formData.start),
      end: new Date(formData.end),
      recurrence: {
        ...formData.recurrence,
        endDate: formData.recurrence.endDate ? new Date(formData.recurrence.endDate) : null
      }
    };
    onSave(dataToSave);
  };

  const handleDelete = (deleteType) => {
    if (deleteType === 'instance' && initialData && initialData.recurrence && initialData.recurrence.frequency !== 'none') {
      const deletedDate = currentInstanceDate || moment(formData.start).format('YYYY-MM-DD');
      const updatedBlackoutDates = initialData.recurrence.blackoutDates
        ? [...initialData.recurrence.blackoutDates, deletedDate]
        : [deletedDate];
  
      const updatedData = {
        ...formData,
        recurrence: {
          ...formData.recurrence,
          blackoutDates: updatedBlackoutDates,
        },
      };
  
      onSave(updatedData);
    } else if (onDelete) {
      onDelete(formData.id, deleteType);
    }
  };
  

  const generateRecurrenceSummary = () => {
    if (formData.recurrence.frequency === 'none') return '';

    let summary = `Occurs every `;
    if (formData.recurrence.interval > 1) {
      summary += `${formData.recurrence.interval} `;
    }
    summary += `${formData.recurrence.frequency}`;
    if (formData.recurrence.interval > 1) summary += 's';

    if (formData.recurrence.frequency === 'week' && formData.recurrence.weekdays.length > 0) {
      summary += ` on ${formData.recurrence.weekdays.join(', ')}`;
    }

    summary += ` starting ${moment(formData.start).format('DD MMM YYYY')}`;

    if (formData.recurrence.endDate) {
      summary += ` until ${moment(formData.recurrence.endDate).format('DD MMM YYYY')}`;
    }

    return summary;
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
          <input
            type="datetime-local"
            id="start"
            name="start"
            value={formData.start}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
        <div className="flex-1">
          <label htmlFor="end" className="label">End</label>
          <input
            type="datetime-local"
            id="end"
            name="end"
            value={formData.end}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="location" className="label">Location</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="input"
          placeholder="Enter location"
        />
      </div>

      <div>
        <label htmlFor="notification" className="label">Notification</label>
        <select
          id="notification"
          name="notification"
          value={formData.notification}
          onChange={handleChange}
          className="input"
        >
          <option value="">No notification</option>
          <option value="15">15 minutes before</option>
          <option value="30">30 minutes before</option>
          <option value="60">1 hour before</option>
          <option value="1440">1 day before</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="label">Recurrence</label>
        <select
          name="frequency"
          value={formData.recurrence.frequency}
          onChange={handleRecurrenceChange}
          className="input"
        >
          <option value="none">Does not repeat</option>
          <option value="day">Daily</option>
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
          <option value="year">Yearly</option>
        </select>

        {formData.recurrence.frequency !== 'none' && (
          <>
            <div className="flex items-center space-x-2">
              <span>Every</span>
              <input
                type="number"
                name="interval"
                value={formData.recurrence.interval}
                onChange={handleRecurrenceChange}
                min="1"
                className="input w-16"
              />
              <span>{formData.recurrence.frequency}(s)</span>
            </div>

            {formData.recurrence.frequency === 'week' && (
              <div className="flex space-x-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <label key={day} className="flex items-center">
                    <input
                      type="checkbox"
                      name="weekdays"
                      value={day}
                      checked={formData.recurrence.weekdays.includes(day)}
                      onChange={handleRecurrenceChange}
                      className="mr-1"
                    />
                    {day}
                  </label>
                ))}
              </div>
            )}

            <div>
              <label htmlFor="recurrenceEndDate" className="label">End Date (optional)</label>
              <input
                type="date"
                id="recurrenceEndDate"
                name="endDate"
                value={formData.recurrence.endDate || ''}
                onChange={handleRecurrenceChange}
                className="input"
              />
            </div>

            <div className="text-sm text-gray-600">
              {generateRecurrenceSummary()}
            </div>
          </>
        )}
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
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {initialData && initialData.id ? 'Update' : 'Create'} Calendar Item
        </button>
      </div>

      {initialData && initialData.id && initialData.recurrence && initialData.recurrence.frequency !== 'none' && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Delete Options</h3>
          <div className="space-x-2">
            <button type="button" onClick={() => handleDelete('instance')} className="btn btn-danger">
              Delete This Instance
            </button>
            <button type="button" onClick={() => handleDelete('series')} className="btn btn-danger">
              Delete Entire Series
            </button>
          </div>
        </div>
      )}
    </form>
  );
};

export default CalendarItemForm;