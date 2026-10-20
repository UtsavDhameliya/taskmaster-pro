import React from 'react';
import {
  Calendar,
  Clock,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Flag,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TaskCard({ todo, onToggleStatus, onEdit, onDelete }) {
  const isCompleted = todo.status === 'completed';

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    const newStatus = isCompleted ? 'pending' : 'completed';

    if (!isCompleted) {
      // Fire confetti burst
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    }

    onToggleStatus(todo.id, newStatus);
  };

  // Priority color config
  const priorityConfig = {
    high: {
      label: 'High',
      badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-900',
      dot: 'bg-rose-500',
    },
    medium: {
      label: 'Medium',
      badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-900',
      dot: 'bg-amber-500',
    },
    low: {
      label: 'Low',
      badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
      dot: 'bg-emerald-500',
    },
  };

  const priorityInfo = priorityConfig[todo.priority?.toLowerCase()] || priorityConfig.medium;

  // Due Date checks
  const formattedDueDate = todo.due_date || todo.task_date;
  const isOverdue =
    formattedDueDate &&
    !isCompleted &&
    new Date(formattedDueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);

  return (
    <div
      className={`group relative p-4 rounded-2xl border transition-all duration-200 ${
        isCompleted
          ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-75'
          : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600/60'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Custom Interactive Checkbox */}
        <button
          onClick={handleCheckboxClick}
          aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
          className={`shrink-0 mt-1 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
            isCompleted
              ? 'bg-emerald-500 text-white shadow-xs'
              : 'border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 dark:hover:border-emerald-500 bg-transparent'
          }`}
        >
          {isCompleted && <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`text-base font-semibold text-slate-800 dark:text-slate-100 leading-snug break-words ${
                isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
              }`}
            >
              {todo.title}
            </h3>

            {/* Actions for desktop / hover */}
            <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(todo)}
                title="Edit task"
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700/60 transition"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(todo.id)}
                title="Move to trash"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Description */}
          {todo.description && (
            <p
              className={`mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed break-words line-clamp-2 ${
                isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
              }`}
            >
              {todo.description}
            </p>
          )}

          {/* Metadata badges footer */}
          <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/50 text-xs">
            {/* Priority Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium border ${priorityInfo.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priorityInfo.dot}`} />
              <span>{priorityInfo.label} Priority</span>
            </span>

            {/* Status indicator */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium capitalize ${
                todo.status === 'in_progress'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
                  : todo.status === 'completed'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {todo.status === 'in_progress' ? 'In Progress' : todo.status}
            </span>

            {/* Due Date */}
            {formattedDueDate && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium ${
                  isOverdue
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-semibold'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {isOverdue ? 'Overdue: ' : 'Due: '}
                  {formattedDueDate}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
