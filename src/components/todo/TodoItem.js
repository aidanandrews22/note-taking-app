import React, { useState } from 'react';
import { useDataContext } from '../../context/DataContext';
import { saveTodoItem, fetchUserData, deleteTodo } from '../../services/DataService';
import { useAuth } from '../../context/AuthContext';
import { Trash2, Edit2, Check, X, Clock, Flag, Tag, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import moment from 'moment';
import SubtaskList from './SubtaskList';
import { Link } from 'react-router-dom';

const importanceColors = [
  'bg-gray-100',  // Low
  'bg-yellow-100', // Medium
  'bg-red-100'    // High
];

const TodoItem = ({ todo, onClick }) => {
  const { updateTodos, notes } = useDataContext();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editedTodo, setEditedTodo] = useState(todo);

  const relatedNote = notes.find(note => note.id === todo.linkedNoteId);

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
      const { todos: updatedTodos } = await fetchUserData(user.uid);
      updateTodos(updatedTodos);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating todo item:', error);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this todo item?')) {
      try {
        await deleteTodo(user.uid, todo.id);
        const { todos: updatedTodos } = await fetchUserData(user.uid);
        updateTodos(updatedTodos);
      } catch (error) {
        console.error('Error deleting todo item:', error);
      }
    }
  };

  const handleStatusChange = async (e) => {
    e.stopPropagation();
    const newStatus = e.target.checked ? 'completed' : 'in-progress';
    const updatedTodo = { ...editedTodo, status: newStatus };
    setEditedTodo(updatedTodo);
    try {
      await saveTodoItem(user.uid, todo.id, updatedTodo);
      const { todos: updatedTodos } = await fetchUserData(user.uid);
      updateTodos(updatedTodos);
    } catch (error) {
      console.error('Error updating todo status:', error);
    }
  };

  const handleSubtasksUpdate = async (updatedSubtasks) => {
    const updatedTodo = { ...editedTodo, subtasks: updatedSubtasks };
    setEditedTodo(updatedTodo);
    try {
      await saveTodoItem(user.uid, todo.id, updatedTodo);
      const { todos: updatedTodos } = await fetchUserData(user.uid);
      updateTodos(updatedTodos);
    } catch (error) {
      console.error('Error updating subtasks:', error);
    }
  };

  return (
    <div 
      className={`todo-item ${editedTodo.status} ${importanceColors[editedTodo.importance]} rounded-lg p-4 cursor-pointer`}
      onClick={() => !isEditing && onClick(todo.id)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={editedTodo.status === 'completed'}
            onChange={handleStatusChange}
            className="form-checkbox h-5 w-5 text-blue-600"
            onClick={(e) => e.stopPropagation()}
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
              <p><strong>Status:</strong> {editedTodo.status}</p>
              <p><strong>Importance:</strong> {['Low', 'Medium', 'High'][editedTodo.importance]}</p>
              <button onClick={() => setIsEditing(true)} className="btn btn-primary">
                Edit Todo
              </button>
            </div>
          )}
          <SubtaskList
            subtasks={editedTodo.subtasks || []}
            onUpdate={handleSubtasksUpdate}
            parentTodo={editedTodo}
          />
          {relatedNote && (
            <div className="mt-2">
              <h4 className="font-semibold">Related Note:</h4>
              <Link 
                to={`/notes/${relatedNote.id}`} 
                className="flex items-center text-blue-500 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <FileText size={16} className="mr-1" />
                {relatedNote.title}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TodoItem;