import React, { useState } from 'react';
import { useDataContext } from '../../context/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Filter, CheckSquare, Square } from 'lucide-react';

const importanceColors = [
  'bg-gray-100',  // Trivial
  'bg-blue-100',  // 1
  'bg-green-100', // 2
  'bg-yellow-100', // 3
  'bg-orange-100', // 4
  'bg-red-100'    // Important!
];

const TodoCalendar = () => {
  const { todos } = useDataContext();
  const [showCompleted, setShowCompleted] = useState(true);
  const navigate = useNavigate();

  // Group todos by date
  const todosByDate = todos.reduce((acc, todo) => {
    if (!showCompleted && todo.status === 'completed') return acc;
    const date = todo.dueDate;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(todo);
    return acc;
  }, {});

  const handleTodoClick = (todoId) => {
    navigate(`/notes/${todoId}`);
  };

  return (
    <div className="todo-calendar">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Todo Calendar</h2>
        <div className="flex items-center">
          <button 
            onClick={() => setShowCompleted(!showCompleted)} 
            className="btn btn-secondary flex items-center mr-2"
          >
            <Filter className="mr-2" size={18} />
            {showCompleted ? 'Hide Completed' : 'Show Completed'}
          </button>
          <Link to="/todos" className="btn btn-secondary">Back to Todos</Link>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(todosByDate).map(([date, todos]) => (
          <div key={date} className="calendar-day bg-white shadow rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Calendar className="mr-2" size={18} />
              {date}
            </h3>
            <ul className="space-y-2">
              {todos.map(todo => (
                <li 
                  key={todo.id} 
                  className={`text-sm p-2 rounded ${importanceColors[todo.importance || 0]} cursor-pointer transition-opacity duration-200 ${todo.status === 'completed' ? 'opacity-50' : 'opacity-100'}`}
                  onClick={() => handleTodoClick(todo.id)}
                >
                  <div className="flex items-center">
                    {todo.status === 'completed' ? (
                      <CheckSquare className="mr-2" size={16} />
                    ) : (
                      <Square className="mr-2" size={16} />
                    )}
                    <span className={todo.status === 'completed' ? 'line-through' : ''}>
                      {todo.title}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoCalendar;