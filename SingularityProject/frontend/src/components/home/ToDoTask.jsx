import React, { useState } from 'react';
import { Trash2, PlusCircle } from 'lucide-react';

const ToDoTasks = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Update portfolio project", completed: false },
    { id: 2, title: "Review teammate pull request", completed: true },
    { id: 3, title: "Draft new proposal for client", completed: false },
  ]);

  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (!newTask.trim()) return;
    const task = {
      id: Date.now(),
      title: newTask,
      completed: false,
    };
    setTasks([task, ...tasks]);
    setNewTask('');
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const removeTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">To-Do Tasks</h3>

      {/* Input to Add Task */}
      <div className="flex items-center space-x-2 mb-4">
        <input
          type="text"
          placeholder="Add a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addTask}
          className="text-blue-600 hover:text-blue-800"
        >
          <PlusCircle size={24} />
        </button>
      </div>

      {/* Task List */}
      <ul className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                className="mr-3 h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              <span className={`${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                {task.title}
              </span>
            </div>
            <button onClick={() => removeTask(task.id)} className="text-red-500 hover:text-red-700">
              <Trash2 size={18} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ToDoTasks;
