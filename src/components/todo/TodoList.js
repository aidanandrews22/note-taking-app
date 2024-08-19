import React, { useState, useEffect } from 'react';
import { useDataContext } from '../../context/DataContext';
import TodoItem from './TodoItem';
import AddTodoForm from './AddTodoForm';
import TodoStats from './TodoStats';
import { Link, useNavigate } from 'react-router-dom';
import { checkUpcomingDeadlines } from '../../utils/todoUtils';
import { Search } from 'lucide-react';

const TodoList = () => {
  const { todos, loading, error, updateNotes } = useDataContext();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('start');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkUpcomingDeadlines(todos);
  }, [todos]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const filteredTodos = todos.filter(todo => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'completed' && todo.status === 'completed') ||
      (filter === 'pending' && todo.status === 'pending');
    const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;

    if (sortBy === 'start') {
      return new Date(a.start) - new Date(b.start);
    }
    if (sortBy === 'end') {
      return new Date(a.end) - new Date(b.end);
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'importance') {
      return (b.importance || 0) - (a.importance || 0);
    }
    return 0;
  });

  const moveTodo = (index, direction) => {
    if (
      (direction === -1 && index === 0) ||
      (direction === 1 && index === sortedTodos.length - 1)
    ) {
      return;
    }

    const newTodos = [...sortedTodos];
    const temp = newTodos[index];
    newTodos[index] = newTodos[index + direction];
    newTodos[index + direction] = temp;

    updateNotes(newTodos);
  };

  const handleTodoClick = (todoId) => {
    navigate(`/notes/${todoId}`);
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
            <option value="pending">Pending</option>
          </select>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="start">Sort by Start Time</option>
            <option value="end">Sort by End Time</option>
            <option value="title">Sort by Title</option>
            <option value="importance">Sort by Importance</option>
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
          <Link to="/todo-calendar" className="btn btn-secondary ml-2">View Calendar</Link>
        </div>
      </div>
      {sortedTodos.map((todo, index) => (
        <TodoItem 
          key={todo.id} 
          todo={todo} 
          onMoveUp={() => moveTodo(index, -1)}
          onMoveDown={() => moveTodo(index, 1)}
          onClick={() => handleTodoClick(todo.id)}
        />
      ))}
    </div>
  );
};

export default TodoList;