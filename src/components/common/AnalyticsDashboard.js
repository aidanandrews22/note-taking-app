import React, { useMemo } from 'react';
import { useDataContext } from '../../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import moment from 'moment';

const AnalyticsDashboard = () => {
  const { todoItems, calendarItems } = useDataContext();

  const taskCompletionData = useMemo(() => {
    const completed = todoItems.filter(item => item.status === 'completed').length;
    const inProgress = todoItems.filter(item => item.status === 'in-progress').length;
    const notStarted = todoItems.filter(item => item.status === 'not-started').length;
    return [
      { name: 'Completed', value: completed },
      { name: 'In Progress', value: inProgress },
      { name: 'Not Started', value: notStarted }
    ];
  }, [todoItems]);

  const categoryDistributionData = useMemo(() => {
    const categories = {};
    [...todoItems, ...calendarItems].forEach(item => {
      if (item.category) {
        categories[item.category] = (categories[item.category] || 0) + 1;
      }
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [todoItems, calendarItems]);

  const weeklyActivityData = useMemo(() => {
    const today = moment();
    const startOfWeek = today.clone().startOf('week');
    const data = Array(7).fill(0).map((_, index) => ({
      name: startOfWeek.clone().add(index, 'days').format('ddd'),
      todos: 0,
      events: 0
    }));

    todoItems.forEach(item => {
      const dayIndex = moment(item.dueDate).diff(startOfWeek, 'days');
      if (dayIndex >= 0 && dayIndex < 7) {
        data[dayIndex].todos++;
      }
    });

    calendarItems.forEach(item => {
      const dayIndex = moment(item.start).diff(startOfWeek, 'days');
      if (dayIndex >= 0 && dayIndex < 7) {
        data[dayIndex].events++;
      }
    });

    return data;
  }, [todoItems, calendarItems]);

  const productivityScore = useMemo(() => {
    const completedTasks = todoItems.filter(item => item.status === 'completed').length;
    const totalTasks = todoItems.length;
    const attendedEvents = calendarItems.filter(item => moment(item.end).isBefore(moment())).length;
    const totalEvents = calendarItems.length;

    const taskScore = totalTasks > 0 ? (completedTasks / totalTasks) * 50 : 0;
    const eventScore = totalEvents > 0 ? (attendedEvents / totalEvents) * 50 : 0;

    return Math.round(taskScore + eventScore);
  }, [todoItems, calendarItems]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="analytics-dashboard">
      <h2 className="text-2xl font-bold mb-4">Analytics Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Task Completion Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taskCompletionData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {taskCompletionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow col-span-1 md:col-span-2">
          <h3 className="text-lg font-semibold mb-2">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="todos" fill="#8884d8" name="Todos" />
              <Bar dataKey="events" fill="#82ca9d" name="Events" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Productivity Score</h3>
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${productivityScore}%` }}></div>
          </div>
          <span className="text-lg font-bold">{productivityScore}%</span>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Your productivity score is based on completed tasks and attended events.
        </p>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;