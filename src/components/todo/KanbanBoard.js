import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useDataContext } from '../../context/DataContext';
import { saveTodoItem, fetchUserData } from '../../services/DataService';
import { useAuth } from '../../context/AuthContext';
import { GripVertical, Flag, Calendar } from 'lucide-react';
import moment from 'moment';

const KanbanBoard = ({ onTodoClick }) => {
  const { todos, updateTodos } = useDataContext();
  const { user } = useAuth();
  const [columns, setColumns] = useState({});
  const columnsRef = useRef({
    'to-do': { id: 'to-do', title: 'To Do', items: [] },
    'in-progress': { id: 'in-progress', title: 'In Progress', items: [] },
    'done': { id: 'done', title: 'Done', items: [] }
  });

  useEffect(() => {
    const newColumns = {
      'to-do': { ...columnsRef.current['to-do'], items: [] },
      'in-progress': { ...columnsRef.current['in-progress'], items: [] },
      'done': { ...columnsRef.current['done'], items: [] }
    };

    todos.forEach(todo => {
      if (todo.status === 'not-started') newColumns['to-do'].items.push(todo);
      else if (todo.status === 'in-progress') newColumns['in-progress'].items.push(todo);
      else if (todo.status === 'completed') newColumns['done'].items.push(todo);
    });

    Object.keys(newColumns).forEach(columnId => {
      newColumns[columnId].items.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    });

    setColumns(newColumns);
  }, [todos]);

  const onDragEnd = useCallback(async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const newColumns = { ...columns };
    const [movedItem] = newColumns[source.droppableId].items.splice(source.index, 1);
    newColumns[destination.droppableId].items.splice(destination.index, 0, movedItem);

    setColumns(newColumns);

    const newStatus = destination.droppableId === 'to-do' ? 'not-started' :
                      destination.droppableId === 'in-progress' ? 'in-progress' : 'completed';

    const updatedTodo = {
      ...movedItem,
      status: newStatus
    };

    try {
      await saveTodoItem(user.uid, updatedTodo.id, updatedTodo);
      const { todos: updatedTodos } = await fetchUserData(user.uid);
      updateTodos(updatedTodos);
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  }, [columns, updateTodos, user.uid]);

  const handleTodoClick = useCallback((id) => {
    if (typeof onTodoClick === 'function') {
      onTodoClick(id);
    }
  }, [onTodoClick]);

  return (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      <DragDropContext onDragEnd={onDragEnd}>
        {Object.values(columns).map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80">
            <h2 className="font-bold mb-4">{column.title}</h2>
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`bg-gray-100 p-4 rounded-lg min-h-[500px] ${
                    snapshot.isDraggingOver ? 'bg-blue-100' : ''
                  }`}
                >
                  {column.items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`bg-white p-4 mb-2 rounded shadow-sm ${
                            snapshot.isDragging ? 'opacity-75' : ''
                          }`}
                        >
                          <div className="flex items-center mb-2">
                            <div {...provided.dragHandleProps} className="mr-2 cursor-move">
                              <GripVertical size={20} />
                            </div>
                            <div className="flex-grow" onClick={() => handleTodoClick(item.id)}>
                              <h3 className="font-semibold">{item.title}</h3>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar size={14} className="mr-1" />
                              <span>{moment(item.dueDate).format('MMM D')}</span>
                            </div>
                            <Flag size={14} className={`text-${item.importance === 0 ? 'gray' : item.importance === 1 ? 'yellow' : 'red'}-500`} />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </DragDropContext>
    </div>
  );  
};

export default KanbanBoard;