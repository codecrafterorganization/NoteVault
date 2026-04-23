import React, { useState } from 'react';
import { CheckCircle2, Circle, Plus, ListTodo } from 'lucide-react';

const ToDoList = () => {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Review Chapter 4 Physics formulas', completed: false },
    { id: 2, text: 'Take biology mock test', completed: false },
    { id: 3, text: 'Read NoteVault PRD carefully', completed: true },
  ]);
  const [newTask, setNewTask] = useState('');

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addTask = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), text: newTask.trim(), completed: false }]);
      setNewTask('');
    }
  };

  return (
    <div className="cinematic-glass p-6 rounded-3xl flex flex-col gap-4 relative overflow-hidden premium-surface min-h-[300px]">
      <div className="flex items-center gap-2 mb-2 z-10 p-2">
        <ListTodo size={18} className="text-slate-400" />
        <h2 className="text-sm font-semibold text-white tracking-wide">Daily Tasks</h2>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 px-2">
        {tasks.map(task => (
          <div 
            key={task.id} 
            onClick={() => toggleTask(task.id)}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-slate-700/50 hover:bg-white/[0.04] transition-all cursor-pointer group"
          >
            {task.completed ? (
               <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
            ) : (
               <Circle size={18} className="text-slate-500 group-hover:text-slate-400 flex-shrink-0" />
            )}
            <span className={`text-sm transition-all ${task.completed ? 'text-slate-500 line-through' : 'text-slate-200 group-hover:text-white'}`}>
              {task.text}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={addTask} className="mt-4 px-2 z-10 flex gap-2">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="What's next on your study list?"
          className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all"
        />
        <button 
          type="submit" 
          disabled={!newTask.trim()}
          className="bg-white text-black p-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100 flex items-center justify-center"
        >
          <Plus size={18} />
        </button>
      </form>
    </div>
  );
};

export default ToDoList;
