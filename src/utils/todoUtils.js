// src/utils/todoUtils.js
import { toast } from 'react-toastify';

export const checkUpcomingDeadlines = (todos) => {
  const today = new Date();
  const twoDaysFromNow = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);

  todos.forEach(todo => {
    if (todo.status === 'pending') {
      const dueDate = new Date(todo.dueDate);
      if (dueDate > today && dueDate <= twoDaysFromNow) {
        toast.info(`Upcoming deadline: "${todo.title}" is due on ${todo.dueDate}`, {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  });
};