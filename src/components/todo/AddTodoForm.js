// src/components/AddTodoForm.js
import React, { useState } from 'react';
import { useDataContext } from '../../context/DataContext';
import { saveNote, fetchUserNotes } from '../../services/DataService';
import { useAuth } from '../../context/AuthContext';

const AddTodoForm = () => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [importance, setImportance] = useState(0);
  const { updateNotes } = useDataContext();
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTodo = {
      title: title.trim(),
      content: '',
      category: 'Todo',
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      status: 'pending',
      isPublic: false,
      importance: importance
    };

    try {
      await saveNote(user.uid, null, newTodo);
      const updatedNotes = await fetchUserNotes(user.uid);
      updateNotes(updatedNotes);
      setTitle('');
      setDueDate('');
      setImportance(0);
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-todo-form">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter new todo"
        className="input mb-4"
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="input mb-4"
      />
      <select
        value={importance}
        onChange={(e) => setImportance(Number(e.target.value))}
        className="input mb-4"
      >
        <option value={0}>Trivial</option>
        <option value={1}>1</option>
        <option value={2}>2</option>
        <option value={3}>3</option>
        <option value={4}>4</option>
        <option value={5}>Important!</option>
      </select>
      <button type="submit" className="btn btn-primary">Add Todo</button>
    </form>
  );
};

export default AddTodoForm;