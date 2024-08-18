// src/components/TodoStats.js
import React from 'react';
import { useDataContext } from '../../context/DataContext';
import { CheckCircle, Clock, BarChart2 } from 'lucide-react';

const TodoStats = () => {
  const { todos } = useDataContext();

  const completedTodos = todos.filter(todo => todo.status === 'completed');
  const pendingTodos = todos.filter(todo => todo.status === 'pending');

  const completionRate = todos.length > 0 
    ? ((completedTodos.length / todos.length) * 100).toFixed(2) 
    : 0;

  return (
    <div className="todo-stats bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <BarChart2 className="mr-2" />
        Todo Statistics
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card bg-blue-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <Clock className="mr-2" />
            Pending Todos
          </h3>
          <p className="text-3xl font-bold">{pendingTodos.length}</p>
        </div>
        <div className="stat-card bg-green-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <CheckCircle className="mr-2" />
            Completed Todos
          </h3>
          <p className="text-3xl font-bold">{completedTodos.length}</p>
        </div>
        <div className="stat-card bg-yellow-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Completion Rate</h3>
          <p className="text-3xl font-bold">{completionRate}%</p>
        </div>
      </div>
    </div>
  );
};

export default TodoStats;