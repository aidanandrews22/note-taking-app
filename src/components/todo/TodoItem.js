import React, { useState } from 'react';
import { useDataContext } from '../../context/DataContext';
import { saveTodo, fetchUserData, deleteTodo } from '../../services/DataService';
import { useAuth } from '../../context/AuthContext';
import { Trash2, Edit2, Check, X, ArrowUp, ArrowDown } from 'lucide-react';
import moment from 'moment';

const importanceColors = [
  'bg-gray-100',  // Trivial
  'bg-blue-100',  // 1
  'bg-green-100', // 2
  'bg-yellow-100', // 3
  'bg-orange-100', // 4
  'bg-red-100'    // Important!
];

const TodoItem = ({ todo, onMoveUp, onMoveDown, onClick }) => {
  const { updateNotes } = useDataContext();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(todo.title);
  const [editedStart, setEditedStart] = useState(moment(todo.start).format('YYYY-MM-DDTHH:mm'));
  const [editedEnd, setEditedEnd] = useState(moment(todo.end).format('YYYY-MM-DDTHH:mm'));
  const [editedImportance, setEditedImportance] = useState(todo.importance || 0);

  const toggleStatus = async (e) => {
    e.stopPropagation();
    const updatedTodo = {
      ...todo,
      status: todo.status === 'completed' ? 'pending' : 'completed'
    };
  
    try {
      await saveTodo(user.uid, todo.id, updatedTodo);
      const { todos: updatedTodos } = await fetchUserData(user.uid);
      updateNotes(updatedTodos);
    } catch (error) {
      console.error('Error updating todo status:', error);
    }
  };
  
  const handleEdit = async (e) => {
    e.stopPropagation();
    if (isEditing) {
      const updatedTodo = {
        ...todo,
        title: editedTitle,
        start: new Date(editedStart),
        end: new Date(editedEnd),
        importance: editedImportance
      };
  
      try {
        await saveTodo(user.uid, todo.id, updatedTodo);
        const { todos: updatedTodos } = await fetchUserData(user.uid);
        updateNotes(updatedTodos);
        setIsEditing(false);
      } catch (error) {
        console.error('Error updating todo:', error);
      }
    } else {
      setIsEditing(true);
    }
  };
  
  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      await deleteTodo(user.uid, todo.id);
      const { todos: updatedTodos } = await fetchUserData(user.uid);
      updateNotes(updatedTodos);
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditedTitle(todo.title);
    setEditedStart(moment(todo.start).format('YYYY-MM-DDTHH:mm'));
    setEditedEnd(moment(todo.end).format('YYYY-MM-DDTHH:mm'));
    setEditedImportance(todo.importance || 0);
  };
  
  const handleImportanceChange = async (e) => {
    e.stopPropagation();
    const newImportance = Number(e.target.value);
    const updatedTodo = {
      ...todo,
      importance: newImportance
    };
  
    try {
      await saveTodo(user.uid, todo.id, updatedTodo);
      const { todos: updatedTodos } = await fetchUserData(user.uid);
      updateNotes(updatedTodos);
    } catch (error) {
      console.error('Error updating todo importance:', error);
    }
  };

  return (
    <div 
      className={`todo-item ${todo.status} ${importanceColors[todo.importance || 0]} flex items-center justify-between p-2 border-b cursor-pointer`}
      onClick={() => onClick(todo.id)}
    >
      {isEditing ? (
        <>
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="mr-2 p-1 border rounded"
            onClick={(e) => e.stopPropagation()}
          />
          <input
            type="datetime-local"
            value={editedStart}
            onChange={(e) => setEditedStart(e.target.value)}
            className="mr-2 p-1 border rounded"
            onClick={(e) => e.stopPropagation()}
          />
          <input
            type="datetime-local"
            value={editedEnd}
            onChange={(e) => setEditedEnd(e.target.value)}
            className="mr-2 p-1 border rounded"
            onClick={(e) => e.stopPropagation()}
          />
          <select
            value={editedImportance}
            onChange={(e) => setEditedImportance(Number(e.target.value))}
            className="mr-2 p-1 border rounded"
            onClick={(e) => e.stopPropagation()}
          >
            <option value={0}>Trivial</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>Important!</option>
          </select>
          <div>
            <button onClick={handleEdit} className="text-green-500 hover:text-green-700 mr-2">
              <Check size={18} />
            </button>
            <button onClick={handleCancelEdit} className="text-red-500 hover:text-red-700">
              <X size={18} />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={todo.status === 'completed'}
              onChange={toggleStatus}
              className="mr-2"
              onClick={(e) => e.stopPropagation()}
            />
            <span className={todo.status === 'completed' ? 'line-through' : ''}>{todo.title}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">{moment(todo.start).format('MMM D, HH:mm')} - {moment(todo.end).format('HH:mm')}</span>
            <select
              value={todo.importance || 0}
              onChange={handleImportanceChange}
              className="mr-2 p-1 border rounded"
              onClick={(e) => e.stopPropagation()}
            >
              <option value={0}>Trivial</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>Important!</option>
            </select>
            <button onClick={(e) => { e.stopPropagation(); onMoveUp(); }} className="text-gray-500 hover:text-gray-700 mr-1">
              <ArrowUp size={18} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onMoveDown(); }} className="text-gray-500 hover:text-gray-700 mr-1">
              <ArrowDown size={18} />
            </button>
            <button onClick={handleEdit} className="text-blue-500 hover:text-blue-700 mr-1">
              <Edit2 size={18} />
            </button>
            <button onClick={handleDelete} className="text-red-500 hover:text-red-700">
              <Trash2 size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TodoItem;