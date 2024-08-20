import React, { useState } from 'react';
import { useDataContext } from '../../context/DataContext';
import { saveTodoItem, fetchUserData } from '../../services/DataService';
import { useAuth } from '../../context/AuthContext';

const AddTodoForm = () => {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [importance, setImportance] = useState(0);
  const { updateTodoItems } = useDataContext();
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !start || !end) return;
  
    const startDate = new Date(start);
    const endDate = new Date(end);
  
    const newTodo = {
      title: title.trim(),
      content: '',
      category: 'Todo',
      start: startDate,
      end: endDate,
      status: 'pending',
      isPublic: false,
      importance: importance
    };
  
    try {
      await saveTodoItem(user.uid, null, newTodo);
      const { todoItems: updatedTodos } = await fetchUserData(user.uid);
      updateTodoItems(updatedTodos);
      setTitle('');
      setStart('');
      setEnd('');
      setImportance(0);
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-todo-form space-y-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter new todo"
        className="input w-full"
      />
      <div className="flex space-x-4">
        <input
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="input flex-grow"
          placeholder="Start time"
        />
        <input
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="input flex-grow"
          placeholder="End time"
        />
      </div>
      <select
        value={importance}
        onChange={(e) => setImportance(Number(e.target.value))}
        className="input w-full"
      >
        <option value={0}>Trivial</option>
        <option value={1}>1</option>
        <option value={2}>2</option>
        <option value={3}>3</option>
        <option value={4}>4</option>
        <option value={5}>Important!</option>
      </select>
      <button type="submit" className="btn btn-primary w-full">Add Todo</button>
    </form>
  );
};

export default AddTodoForm;