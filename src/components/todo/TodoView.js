import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDataContext } from '../../context/DataContext';
import { saveTodo, fetchUserData } from '../../services/DataService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import moment from 'moment';

const TodoView = () => {
  const { todos, loading, error, updateTodos } = useDataContext();
  const { todoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedTodo, setEditedTodo] = useState(null);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  const todo = todos.find(t => t.id === todoId);

  if (!todo) return <ErrorMessage message="Todo not found" />;

  const handleEdit = () => {
    setIsEditing(true);
    setEditedTodo({ ...todo });
  };

  const handleSave = async () => {
    try {
      await saveTodo(user.uid, todoId, editedTodo);
      const { todos: updatedTodos } = await fetchUserData(user.uid);
      updateTodos(updatedTodos);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving todo:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTodo(null);
  };

  return (
    <div>
      <Link to="/todos" className="text-blue-500 hover:underline mb-4 inline-block">&larr; Back to todos</Link>
      {isEditing ? (
        <div>
          <input
            type="text"
            value={editedTodo.title}
            onChange={(e) => setEditedTodo({ ...editedTodo, title: e.target.value })}
            className="w-full p-2 mb-2 border rounded"
          />
          <textarea
            value={editedTodo.content}
            onChange={(e) => setEditedTodo({ ...editedTodo, content: e.target.value })}
            className="w-full p-2 mb-2 border rounded"
            rows="4"
          />
          <input
            type="datetime-local"
            value={moment(editedTodo.start).format('YYYY-MM-DDTHH:mm')}
            onChange={(e) => setEditedTodo({ ...editedTodo, start: new Date(e.target.value) })}
            className="w-full p-2 mb-2 border rounded"
          />
          <input
            type="datetime-local"
            value={moment(editedTodo.end).format('YYYY-MM-DDTHH:mm')}
            onChange={(e) => setEditedTodo({ ...editedTodo, end: new Date(e.target.value) })}
            className="w-full p-2 mb-2 border rounded"
          />
          <select
            value={editedTodo.importance}
            onChange={(e) => setEditedTodo({ ...editedTodo, importance: Number(e.target.value) })}
            className="w-full p-2 mb-2 border rounded"
          >
            <option value={0}>Trivial</option>
            <option value={1}>Low</option>
            <option value={2}>Medium</option>
            <option value={3}>High</option>
            <option value={4}>Very High</option>
            <option value={5}>Critical</option>
          </select>
          <div>
            <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Save</button>
            <button onClick={handleCancel} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
          </div>
        </div>
      ) : (
        <div>
          <h1 className="text-3xl font-bold mb-2">{todo.title}</h1>
          <p className="text-gray-600 mb-4">
            Start: {moment(todo.start).format('MMMM D, YYYY HH:mm')} - 
            End: {moment(todo.end).format('MMMM D, YYYY HH:mm')}
          </p>
          <p className="text-gray-600 mb-4">Importance: {todo.importance}</p>
          <div className="prose max-w-none mb-4">{todo.content}</div>
          <button onClick={handleEdit} className="bg-blue-500 text-white px-4 py-2 rounded">Edit Todo</button>
        </div>
      )}
    </div>
  );
};

export default TodoView;