import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDataContext } from '../../context/DataContext';
import { saveCalendarItem, deleteCalendarItem, fetchUserData } from '../../services/DataService';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, MapPin, AlertCircle, RepeatIcon, Flag, CheckCircle, Edit2, Trash2, X } from 'lucide-react';
import moment from 'moment';
import CalendarItemForm from './CalendarItemForm';

const CalendarItemView = ({ itemId, onClose, onEdit, currentInstanceDate }) => {
  const navigate = useNavigate();
  const { calendarItems, updateCalendarItems } = useDataContext();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      if (calendarItems) {
        const foundItem = calendarItems.find(i => i.id === itemId);
        if (foundItem) {
          setItem(foundItem);
        } else {
          onClose();
        }
      }
    };

    fetchItem();
  }, [itemId, calendarItems, onClose]);

  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit();
    } else {
      setIsEditing(true);
    }
  }, [onEdit]);

  const handleSave = useCallback(async (updatedItem) => {
    try {
      await saveCalendarItem(user.uid, itemId, updatedItem);
      const { calendarItems: updatedCalendarItems } = await fetchUserData(user.uid);
      updateCalendarItems(updatedCalendarItems);
      setItem(updatedItem);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating calendar item:', error);
    }
  }, [user.uid, itemId, updateCalendarItems]);

  const handleDelete = async (deleteType) => {
    const confirmMessage = deleteType === 'series' 
      ? 'Are you sure you want to delete this entire series?' 
      : 'Are you sure you want to delete this event?';
  
    if (window.confirm(confirmMessage)) {
      try {
        if (deleteType === 'instance' && item.recurrence && item.recurrence.frequency !== 'none') {
          const deletedDate = currentInstanceDate || moment(item.start).format('YYYY-MM-DD');
          const updatedBlackoutDates = item.recurrence.blackoutDates
            ? [...item.recurrence.blackoutDates, deletedDate]
            : [deletedDate];
          
          const updatedItem = {
            ...item,
            recurrence: {
              ...item.recurrence,
              blackoutDates: updatedBlackoutDates,
            },
          };
          
          await saveCalendarItem(user.uid, itemId, updatedItem);
        } else {
          await deleteCalendarItem(user.uid, itemId, deleteType);
        }
        
        const { calendarItems: updatedCalendarItems } = await fetchUserData(user.uid);
        updateCalendarItems(updatedCalendarItems);
        onClose();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const memoizedItem = useMemo(() => item, [item]);

  if (!memoizedItem) {
    return <div>Loading...</div>;
  }

  return (
    <div className="calendar-item-view bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{isEditing ? 'Edit Event' : memoizedItem.title}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>
      {isEditing ? (
        <CalendarItemForm
          initialData={memoizedItem}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
          onDelete={handleDelete}
          currentInstanceDate={currentInstanceDate}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center">
            <Calendar className="mr-2" size={20} />
            <span>{moment(item.start).format('MMMM D, YYYY')}</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-2" size={20} />
            <span>
              {moment(item.start).format('h:mm A')} - {moment(item.end).format('h:mm A')}
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
          {item.notification && (
            <div className="flex items-center">
              <AlertCircle className="mr-2" size={20} />
              <span>Notification: {item.notification} minutes before</span>
            </div>
          )}
          {item.recurrence && item.recurrence.frequency !== 'none' && (
            <div className="flex items-center">
              <RepeatIcon className="mr-2" size={20} />
              <span>Repeats: {item.recurrence.frequency}</span>
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
          <div className="flex justify-between mt-6">
            <button onClick={handleEdit} className="btn btn-primary">
              <Edit2 size={18} className="mr-1" /> Edit
            </button>
            {memoizedItem.recurrence && memoizedItem.recurrence.frequency !== 'none' ? (
              <div>
                <button onClick={() => handleDelete('instance')} className="btn btn-danger mr-2">
                  <Trash2 size={18} className="mr-1" /> Delete This Instance
                </button>
                <button onClick={() => handleDelete('series')} className="btn btn-danger">
                  <Trash2 size={18} className="mr-1" /> Delete Entire Series
                </button>
              </div>
            ) : (
              <button onClick={() => handleDelete('single')} className="btn btn-danger">
                <Trash2 size={18} className="mr-1" /> Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarItemView;