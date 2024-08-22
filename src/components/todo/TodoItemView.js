import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDataContext } from '../../context/DataContext';
import { saveTodoItem, deleteTodoItem } from '../../services/DataService';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, CheckSquare, AlertCircle, Tag, Flag, Edit2, Trash2, Plus, X } from 'lucide-react';
import moment from 'moment';
import SubtaskList from './SubtaskList';

const TodoItemView = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { todos, updateTodos } = useDataContext();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (todos) {
      const foundItem = todos.find(i => i.id === itemId);
      if (foundItem) {
        setItem(foundItem);
      } else {
        navigate('/todos');
      }
    }
  }, [itemId, todos, navigate]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async (updatedItem) => {
    try {
      await saveTodoItem(user.uid, itemId, updatedItem);
      setItem(updatedItem);
      setIsEditing(false);
      const updatedTodos = todos.map(todo => 
        todo.id === itemId ? updatedItem : todo
      );
      updateTodos(updatedTodos);
    } catch (error) {
      console.error('Error updating todo item:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        await deleteTodoItem(user.uid, itemId);
        navigate('/todos');
      } catch (error) {
        console.error('Error deleting todo item:', error);
      }
    }
  };

  const handleSubtaskUpdate = async (updatedSubtasks) => {
    const updatedItem = { ...item, subtasks: updatedSubtasks };
    setItem(updatedItem);
    try {
      await saveTodoItem(user.uid, itemId, updatedItem);
      const updatedTodos = todos.map(todo => 
        todo.id === itemId ? updatedItem : todo
      );
      updateTodos(updatedTodos);
    } catch (error) {
      console.error('Error updating subtasks:', error);
    }
  };

  if (!item) {
    return <div>Loading...</div>;
  }

  return (
    <div className="todo-item-view">
      <Link to="/todos" className="btn btn-secondary mb-4">&larr; Back to Todos</Link>
      {isEditing ? (
        <TodoItemForm item={item} onSave={handleSave} onCancel={() => setIsEditing(false)} />
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
              <span>Due: {moment(item.dueDate).format('MMMM D, YYYY h:mm A')}</span>
            </div>
            <div className="flex items-center">
              <CheckSquare className="mr-2" size={20} />
              <span>Status: {item.status}</span>
            </div>
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
            {item.tags && item.tags.length > 0 && (
              <div className="flex items-center">
                <Tag className="mr-2" size={20} />
                <span>Tags: {item.tags.join(', ')}</span>
              </div>
            )}
            <div className="flex items-center">
              <Flag className={`mr-2 text-${item.importance}-500`} size={20} />
              <span>Importance: {['Low', 'Medium', 'High'][item.importance]}</span>
            </div>
            {item.estimatedTime && (
              <div className="flex items-center">
                <Clock className="mr-2" size={20} />
                <span>Estimated Time: {item.estimatedTime} minutes</span>
              </div>
            )}
            <div>
              <h3 className="font-semibold mb-2">Subtasks</h3>
              <SubtaskList 
                subtasks={item.subtasks || []} 
                onUpdate={handleSubtaskUpdate}
                parentTodo={item}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TodoItemForm = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    ...item,
    subtasks: Array.isArray(item.subtasks) ? item.subtasks : []
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubtaskUpdate = (updatedSubtasks) => {
    setFormData(prev => ({ ...prev, subtasks: updatedSubtasks }));
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
        placeholder="Todo Title"
        required
      />
      <input
        type="datetime-local"
        name="dueDate"
        value={moment(formData.dueDate).format('YYYY-MM-DDTHH:mm')}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />
      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option value="not-started">Not Started</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
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
      <input
        type="text"
        name="tags"
        value={formData.tags ? formData.tags.join(', ') : ''}
        onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value.split(',').map(tag => tag.trim()) }))}
        className="w-full p-2 border rounded"
        placeholder="Tags (comma-separated)"
      />
      <select
        name="importance"
        value={formData.importance}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option value="0">Low</option>
        <option value="1">Medium</option>
        <option value="2">High</option>
      </select>
      <input
        type="number"
        name="estimatedTime"
        value={formData.estimatedTime}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        placeholder="Estimated Time (minutes)"
      />
      <div>
        <h3 className="font-semibold mb-2">Subtasks</h3>
        <SubtaskList 
          subtasks={formData.subtasks} 
          onUpdate={handleSubtaskUpdate}
          parentTodo={formData}
        />
      </div>
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

export default TodoItemView;