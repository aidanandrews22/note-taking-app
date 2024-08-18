import React, { useState } from 'react';
import { useDataContext } from '../../context/DataContext';
import { saveNote, fetchUserNotes, deleteNote } from '../../services/DataService';
import { useAuth } from '../../context/AuthContext';
import { Trash2, Edit2, Check, X, ArrowUp, ArrowDown } from 'lucide-react';

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
  const [editedDueDate, setEditedDueDate] = useState(todo.dueDate);
  const [editedImportance, setEditedImportance] = useState(todo.importance || 0);

  const toggleStatus = async (e) => {
    e.stopPropagation();
    const updatedTodo = {
      ...todo,
      status: todo.status === 'completed' ? 'pending' : 'completed'
    };

    try {
      await saveNote(user.uid, todo.id, updatedTodo);
      const updatedNotes = await fetchUserNotes(user.uid);
      updateNotes(updatedNotes);
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
        dueDate: editedDueDate,
        importance: editedImportance
      };

      try {
        await saveNote(user.uid, todo.id, updatedTodo);
        const updatedNotes = await fetchUserNotes(user.uid);
        updateNotes(updatedNotes);
        setIsEditing(false);
      } catch (error) {
        console.error('Error updating todo:', error);
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditedTitle(todo.title);
    setEditedDueDate(todo.dueDate);
    setEditedImportance(todo.importance || 0);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      await deleteNote(user.uid, todo.id);
      const updatedNotes = await fetchUserNotes(user.uid);
      updateNotes(updatedNotes);
    } catch (error) {
      console.error('Error deleting todo:', error);
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
            type="date"
            value={editedDueDate}
            onChange={(e) => setEditedDueDate(e.target.value)}
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
            <span className="mr-2">{todo.dueDate}</span>
            <select
              value={todo.importance || 0}
              onChange={(e) => handleEdit({ ...todo, importance: Number(e.target.value) })}
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