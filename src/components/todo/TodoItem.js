import React, { useState } from 'react';
import { useDataContext } from '../../context/DataContext';
import { saveTodoItem, fetchUserData, deleteTodoItem } from '../../services/DataService';
import { useAuth } from '../../context/AuthContext';
import { Trash2, Edit2, Check, X, Clock, Flag, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import moment from 'moment';

const importanceColors = [
  'bg-gray-100',  // Low
  'bg-yellow-100', // Medium
  'bg-red-100'    // High
];

const TodoItem = ({ todo, onClick }) => {
  const { updateTodoItems } = useDataContext();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editedTodo, setEditedTodo] = useState(todo);
  const [newSubtask, setNewSubtask] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedTodo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    try {
      await saveTodoItem(user.uid, todo.id, editedTodo);
      const { todoItems: updatedTodoItems } = await fetchUserData(user.uid);
      updateTodoItems(updatedTodoItems);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating todo item:', error);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this todo item?')) {
      try {
        await deleteTodoItem(user.uid, todo.id);
        const { todoItems: updatedTodoItems } = await fetchUserData(user.uid);
        updateTodoItems(updatedTodoItems);
      } catch (error) {
        console.error('Error deleting todo item:', error);
      }
    }
  };

  const handleSubtaskToggle = async (subtaskId) => {
    const updatedSubtasks = editedTodo.subtasks.map(subtask =>
      subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
    );
    const updatedTodo = { ...editedTodo, subtasks: updatedSubtasks };
    setEditedTodo(updatedTodo);
    await handleSave({ stopPropagation: () => {} });
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    const newSubtaskItem = {
      id: Date.now().toString(),
      title: newSubtask.trim(),
      completed: false
    };
    const updatedTodo = {
      ...editedTodo,
      subtasks: [...(editedTodo.subtasks || []), newSubtaskItem]
    };
    setEditedTodo(updatedTodo);
    setNewSubtask('');
    await handleSave({ stopPropagation: () => {} });
  };

  const calculateProgress = () => {
    if (!editedTodo.subtasks || editedTodo.subtasks.length === 0) return 0;
    const completedSubtasks = editedTodo.subtasks.filter(subtask => subtask.completed).length;
    return (completedSubtasks / editedTodo.subtasks.length) * 100;
  };

  return (
    <div 
      className={`todo-item ${editedTodo.status} ${importanceColors[editedTodo.importance]} p-4 border-b cursor-pointer`}
      onClick={() => !isEditing && onClick(todo.id)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={editedTodo.status === 'completed'}
            onChange={(e) => {
              e.stopPropagation();
              setEditedTodo(prev => ({ ...prev, status: e.target.checked ? 'completed' : 'in-progress' }));
              handleSave(e);
            }}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          <span className={editedTodo.status === 'completed' ? 'line-through' : ''}>{editedTodo.title}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock size={18} />
          <span>{moment(editedTodo.dueDate).format('MMM D, HH:mm')}</span>
          <Flag size={18} className={`text-${editedTodo.importance === 0 ? 'gray' : editedTodo.importance === 1 ? 'yellow' : 'red'}-500`} />
          {editedTodo.tags && editedTodo.tags.map((tag, index) => (
            <Tag key={index} size={18} className="text-blue-500" />
          ))}
          <button onClick={(e) => { e.stopPropagation(); setIsEditing(!isEditing); }} className="btn btn-secondary">
            <Edit2 size={18} />
          </button>
          <button onClick={handleDelete} className="btn btn-danger">
            <Trash2 size={18} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="btn btn-secondary">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="mt-4 space-y-2" onClick={(e) => e.stopPropagation()}>
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                name="title"
                value={editedTodo.title}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
              <input
                type="datetime-local"
                name="dueDate"
                value={moment(editedTodo.dueDate).format('YYYY-MM-DDTHH:mm')}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
              <select
                name="importance"
                value={editedTodo.importance}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value={0}>Low</option>
                <option value={1}>Medium</option>
                <option value={2}>High</option>
              </select>
              <select
                name="status"
                value={editedTodo.status}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <input
                type="number"
                name="estimatedTime"
                value={editedTodo.estimatedTime}
                onChange={handleChange}
                placeholder="Estimated time (minutes)"
                className="w-full p-2 border rounded"
              />
              <textarea
                name="description"
                value={editedTodo.description}
                onChange={handleChange}
                placeholder="Description"
                className="w-full p-2 border rounded"
                rows="3"
              ></textarea>
              <div>
                <button onClick={handleSave} className="btn btn-primary mr-2">Save</button>
                <button onClick={() => setIsEditing(false)} className="btn btn-secondary">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p><strong>Description:</strong> {editedTodo.description}</p>
              <p><strong>Estimated Time:</strong> {editedTodo.estimatedTime} minutes</p>
              <p><strong>Status:</strong> {editedTodo.status}</p>
              <p><strong>Importance:</strong> {['Low', 'Medium', 'High'][editedTodo.importance]}</p>
            </div>
          )}
          <div>
            <h4 className="font-bold mb-2">Subtasks</h4>
            {editedTodo.subtasks && editedTodo.subtasks.map(subtask => (
              <div key={subtask.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={subtask.completed}
                  onChange={() => handleSubtaskToggle(subtask.id)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className={subtask.completed ? 'line-through' : ''}>{subtask.title}</span>
              </div>
            ))}
            <form onSubmit={handleAddSubtask} className="mt-2 flex">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="New subtask"
                className="flex-grow p-2 border rounded-l"
              />
              <button type="submit" className="btn btn-primary rounded-r">Add</button>
            </form>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-1">Progress: {calculateProgress().toFixed(0)}%</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoItem;