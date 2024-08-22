import React, { useState } from 'react';
import { CheckSquare, Edit2, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import moment from 'moment';

const SubtaskList = ({ subtasks, onUpdate, parentTodo }) => {
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [expandedSubtaskId, setExpandedSubtaskId] = useState(null);
  const item = parentTodo;
  const [newSubtask, setNewSubtask] = useState({
    title: '',
    description: '',
    status: 'not-started',
    dueDate: moment().add(1, 'day').format('YYYY-MM-DDTHH:mm'),
    importance: 0
  });

  const getImportanceColor = (importance) => {
    switch (importance) {
      case 0:
        return 'bg-green-100';
      case 1:
        return 'bg-yellow-100';
      case 2:
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  const handleSubtaskChange = (subtaskId, field, value) => {
    const updatedSubtasks = subtasks.map(subtask => 
      subtask.id === subtaskId ? { ...subtask, [field]: value } : subtask
    );
    onUpdate(updatedSubtasks);
  };

  const handleAddSubtask = () => {
    if (newSubtask.title.trim()) {
      const updatedSubtasks = [...subtasks, { ...newSubtask, id: Date.now().toString() }];
      onUpdate(updatedSubtasks);
      setNewSubtask({
        title: '',
        description: '',
        status: 'not-started',
        dueDate: moment().add(1, 'day').format('YYYY-MM-DDTHH:mm'),
        importance: 0
      });
    }
  };

  const handleDeleteSubtask = (subtaskId) => {
    const updatedSubtasks = subtasks.filter(subtask => subtask.id !== subtaskId);
    onUpdate(updatedSubtasks);
  };

  const handleEditClick = (subtaskId) => {
    setEditingSubtaskId(subtaskId);
    setExpandedSubtaskId(null);
  };

  const handleSaveEdit = () => {
    setEditingSubtaskId(null);
  };

  const toggleExpand = (subtaskId) => {
    setExpandedSubtaskId(expandedSubtaskId === subtaskId ? null : subtaskId);
    setEditingSubtaskId(null);
  };

  const calculateProgress = () => {
    if (!item.subtasks || item.subtasks.length === 0) return 0;
    const completedSubtasks = item.subtasks.filter(subtask => subtask.status === 'completed').length;
    return (completedSubtasks / item.subtasks.length) * 100;
  };

  return (
    <div className="subtask-list">
      {subtasks.map((subtask) => (
        <div key={subtask.id} className={`subtask-item ${getImportanceColor(subtask.importance)} p-4 rounded-lg mb-2`}>
          {editingSubtaskId === subtask.id ? (
            <div className="grid grid-cols-2 gap-2">
              <input 
                type="text" 
                value={subtask.title} 
                onChange={(e) => handleSubtaskChange(subtask.id, 'title', e.target.value)}
                className="col-span-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <input 
                type="text" 
                value={subtask.description} 
                onChange={(e) => handleSubtaskChange(subtask.id, 'description', e.target.value)}
                placeholder="Description"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <input 
                type="datetime-local" 
                value={moment(subtask.dueDate).format('YYYY-MM-DDTHH:mm')} 
                onChange={(e) => handleSubtaskChange(subtask.id, 'dueDate', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <select 
                value={subtask.status} 
                onChange={(e) => handleSubtaskChange(subtask.id, 'status', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <select 
                value={subtask.importance} 
                onChange={(e) => handleSubtaskChange(subtask.id, 'importance', parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value={0}>Low</option>
                <option value={1}>Medium</option>
                <option value={2}>High</option>
              </select>
              <button onClick={handleSaveEdit} className="btn btn-primary col-span-2">
                Save Changes
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <CheckSquare 
                    size={18} 
                    className={`mr-2 ${subtask.status === 'completed' ? 'text-green-500' : 'text-gray-500'}`}
                    onClick={() => handleSubtaskChange(subtask.id, 'status', subtask.status === 'completed' ? 'in-progress' : 'completed')}
                  />
                  <span 
                    className={`${subtask.status === 'completed' ? 'line-through' : ''} cursor-pointer`}
                    onClick={() => toggleExpand(subtask.id)}
                  >
                    {subtask.title}
                  </span>
                </div>
                <div>
                  <button onClick={() => toggleExpand(subtask.id)} className="btn btn-secondary mr-2">
                    {expandedSubtaskId === subtask.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  <button onClick={() => handleEditClick(subtask.id)} className="btn btn-secondary mr-2">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDeleteSubtask(subtask.id)} className="btn btn-danger">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              {expandedSubtaskId === subtask.id && (
                <div className="mt-2 pl-6">
                  <p><strong>Description:</strong> {subtask.description || 'No description'}</p>
                  <p><strong>Due Date:</strong> {moment(subtask.dueDate).format('MMMM D, YYYY h:mm A')}</p>
                  <p><strong>Status:</strong> {subtask.status}</p>
                  <p><strong>Importance:</strong> {['Low', 'Medium', 'High'][subtask.importance]}</p>
                </div>
              )}
            </>
          )}
        </div>
      ))}
      <div className="add-subtask mt-4">
        <h4 className="font-semibold mb-2">Add New Subtask</h4>
        <div className="flex items-center">
          <input 
            type="text" 
            value={newSubtask.title} 
            onChange={(e) => setNewSubtask({ ...newSubtask, title: e.target.value })}
            placeholder="New Subtask Title"
            className="flex-grow mr-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <button onClick={handleAddSubtask} className="btn btn-primary">
            <Plus size={18} />
          </button>
        </div>
        <div>
            <h3 className="font-semibold mb-2">Progress</h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-500">{calculateProgress().toFixed(0)}% Complete</span>
          </div>
      </div>
    </div>
  );
};

export default SubtaskList;