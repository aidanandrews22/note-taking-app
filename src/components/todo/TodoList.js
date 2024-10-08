import React, { useState, useEffect } from 'react';
import { useDataContext } from '../../context/DataContext';
import TodoItem from './TodoItem';
import AddTodoForm from './AddTodoForm';
import TodoStats from './TodoStats';
import { Link, useNavigate } from 'react-router-dom';
import { checkUpcomingDeadlines } from '../../utils/todoUtils';
import { Search, Filter, Calendar, List, Columns, AlertTriangle } from 'lucide-react';
import KanbanBoard from './KanbanBoard';
import TodoCalendar from '../calendar/TodoCalendar';

const TodoList = () => {
  const { todos, loading, error, reloadData } = useDataContext();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState(() => {
    return localStorage.getItem('todoView') || 'list';
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (todos && todos.length > 0) {
      checkUpcomingDeadlines(todos);
    }
  }, [todos]);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  useEffect(() => {
    localStorage.setItem('todoView', view);
  }, [view]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const filteredTodos = (todos || []).filter(todo => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'completed' && todo.status === 'completed') ||
      (filter === 'in-progress' && todo.status === 'in-progress') ||
      (filter === 'not-started' && todo.status === 'not-started');
    const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    // First, sort completed todos to the bottom
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    
    // If both todos have the same completion status, sort according to the selected criteria
    if (sortBy === 'dueDate') {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'importance') {
      return b.importance - a.importance;
    }
    return 0;
  });

  const topThreeTodos = sortedTodos
    .filter(todo => todo.status !== 'completed')
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 3);

  const handleTodoClick = (todoId) => {
    navigate(`/todos/${todoId}`);
  };

  const renderView = () => {
    switch (view) {
      case 'kanban':
        return <KanbanBoard onTodoClick={handleTodoClick} />;
      case 'calendar':
        return <TodoCalendar todos={sortedTodos} onTodoClick={handleTodoClick} />;
      default:
        return (
          <div className="space-y-4">
            {sortedTodos.map((todo) => (
              <TodoItem 
                key={todo.id} 
                todo={todo} 
                onClick={handleTodoClick}
              />
            ))}
          </div>
        );
    }
  };

  return (
    <div className="todo-list">
      <h2 className="text-2xl font-bold mb-4">My Todos</h2>
      <TodoStats />
      <AddTodoForm />

      {/* Top 3 Important Todos */}
      {topThreeTodos.length > 0 && (
        <div className="my-6 p-4 bg-red-200 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <AlertTriangle className="mr-2" size={20} />
            Top Priority Todos
          </h3>
          <div className="space-y-2">
            {topThreeTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onClick={handleTodoClick}
                isTopPriority={true}
              />
            ))}
          </div>
        </div>
      )}

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
          </select>
        </div>
        <div className="flex items-center mt-2 sm:mt-0">
          <div className="relative mr-2">
            <input
              type="text"
              placeholder="Search todos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 pl-8 border rounded w-full sm:w-auto"
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <div className="flex space-x-2">
            <button onClick={() => setView('list')} className={`btn btn-icon ${view === 'list' ? 'btn-primary' : 'btn-secondary'}`}>
              <List size={18} />
            </button>
            <button onClick={() => setView('kanban')} className={`btn btn-icon ${view === 'kanban' ? 'btn-primary' : 'btn-secondary'}`}>
              <Columns size={18} />
            </button>
            <button onClick={() => setView('calendar')} className={`btn btn-icon ${view === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}>
              <Calendar size={18} />
            </button>
          </div>
        </div>
      </div>
      {renderView()}
    </div>
  );
};

export default TodoList;