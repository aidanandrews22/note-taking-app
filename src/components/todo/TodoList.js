import React, { useState, useEffect } from 'react';
import { useDataContext } from '../../context/DataContext';
import TodoItem from './TodoItem';
import AddTodoForm from './AddTodoForm';
import TodoStats from './TodoStats';
import { Link, useNavigate } from 'react-router-dom';
import { checkUpcomingDeadlines } from '../../utils/todoUtils';
import { Search, Filter, Calendar } from 'lucide-react';

const TodoList = () => {
  const { todoItems, loading, error } = useDataContext();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('TodoItems in TodoList:', todoItems);
  }, [todoItems]);

  useEffect(() => {
    if (todoItems) {
      checkUpcomingDeadlines(todoItems);
    }
  }, [todoItems]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const filteredTodos = (todoItems || []).filter(todo => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'completed' && todo.status === 'completed') ||
      (filter === 'in-progress' && todo.status === 'in-progress') ||
      (filter === 'not-started' && todo.status === 'not-started');
    const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (sortBy === 'dueDate') {
      return new Date(a.end) - new Date(b.end);
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'importance') {
      return b.importance - a.importance;
    }
    return 0;
  });

  const handleTodoClick = (todoId) => {
    navigate(`/todos/${todoId}`);
  };

  return (
    <div className="todo-list">
      <h2 className="text-2xl font-bold mb-4">My Todos</h2>
      <TodoStats />
      <AddTodoForm />
      <div className="my-4 flex flex-wrap justify-between items-center">
        <div className="flex items-center mb-2 sm:mb-0">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="mr-2 p-2 border rounded"
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="in-progress">In Progress</option>
            <option value="not-started">Not Started</option>
          </select>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="title">Sort by Title</option>
            <option value="importance">Sort by Importance</option>
            <option value="estimatedTime">Sort by Estimated Time</option>
          </select>
        </div>
        <div className="flex items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search todos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 pl-8 border rounded"
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <Link to="/calendar" className="btn btn-secondary ml-2 flex items-center">
            <Calendar className="mr-2" size={18} />
            View Calendar
          </Link>
        </div>
      </div>
      {sortedTodos.map((todo) => (
        <TodoItem 
          key={todo.id} 
          todo={todo} 
          onClick={() => handleTodoClick(todo.id)}
        />
      ))}
    </div>
  );
};

export default TodoList;