import React, { useState } from 'react';
import moment from 'moment';
import { useDataContext } from '../../context/DataContext';
import { saveTodoItem, fetchUserData } from '../../services/DataService';
import { useAuth } from '../../context/AuthContext';
import { PlusCircle, ChevronDown, ChevronUp } from 'lucide-react';

const AddTodoForm = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: moment().format('YYYY-MM-DDTHH:mm'),
    allDay: false,
    category: '',
    importance: 1,
    status: 'not-started',
    linkedNoteId: ''
  });
  const { updateTodos, notes } = useDataContext();
  const { user } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.dueDate) return;

    const newTodo = {
      ...formData,
      subtasks: [],
      dueDate: new Date(formData.dueDate)
    };

    try {
      await saveTodoItem(user.uid, null, newTodo);
      const { todos: updatedTodos } = await fetchUserData(user.uid);
      updateTodos(updatedTodos);
      setFormData({
        title: '',
        description: '',
        dueDate: moment().format('YYYY-MM-DDTHH:mm'),
        allDay: false,
        category: '',
        importance: 1,
        status: 'not-started',
        linkedNoteId: ''
      });
      setIsExpanded(false);
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  return (
    <div className="add-todo-form bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-lg font-bold">Add New Todo</span>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isExpanded && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="3"
            />
          </div>
          <div>
            <label htmlFor="dueDate" className="block text-gray-700 text-sm font-bold mb-2">Due Date</label>
            <input
              type="datetime-local"
              id="dueDate"
              name="dueDate"
              value={moment(formData.dueDate).format('YYYY-MM-DDTHH:mm')}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="allDay"
                checked={formData.allDay}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-gray-700 text-sm font-bold">All-day event</span>
            </label>
          </div>
          <div>
            <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Select a category</option>
              <option value="personal">Personal</option>
              <option value="work">Work</option>
              <option value="school">School</option>
            </select>
          </div>
          <div>
            <label htmlFor="importance" className="block text-gray-700 text-sm font-bold mb-2">Importance</label>
            <select
              id="importance"
              name="importance"
              value={formData.importance}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value={0}>Low</option>
              <option value={1}>Medium</option>
              <option value={2}>High</option>
            </select>
          </div>
          <div>
            <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label htmlFor="linkedNoteId" className="block text-gray-700 text-sm font-bold mb-2">Linked Note</label>
            <select
              id="linkedNoteId"
              name="linkedNoteId"
              value={formData.linkedNoteId}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Select a note (optional)</option>
              {notes.map(note => (
                <option key={note.id} value={note.id}>{note.title}</option>
              ))}
            </select>
          </div>
          <div>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center">
              <PlusCircle className="mr-2" size={20} />
              Add Todo
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddTodoForm;
