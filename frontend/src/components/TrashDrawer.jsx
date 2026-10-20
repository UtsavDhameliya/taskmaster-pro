import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Trash2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { api } from '../api/client';
import { useToast } from './Toast';

export default function TrashDrawer({ isOpen, onClose, onTaskRestored }) {
  const [deletedTasks, setDeletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const toast = useToast();

  const loadTrash = async () => {
    setLoading(true);
    try {
      const data = await api.getTrash();
      setDeletedTasks(data || []);
    } catch (err) {
      toast.error('Failed to load trash: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTrash();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRestore = async (id) => {
    setActionLoadingId(id);
    try {
      await api.restoreTodo(id);
      toast.success('Task restored successfully!');
      setDeletedTasks((prev) => prev.filter((t) => t.id !== id));
      if (onTaskRestored) onTaskRestored();
    } catch (err) {
      toast.error(err.message || 'Failed to restore task');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePermanentDelete = async (id) => {
    if (!window.confirm('Delete this task permanently? It cannot be recovered.')) {
      return;
    }
    setActionLoadingId(id);
    try {
      await api.permanentDeleteTodo(id);
      toast.success('Task permanently deleted');
      setDeletedTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      toast.error(err.message || 'Failed to permanently delete');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl max-h-[85vh] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Trash & Recovery
              </h2>
              <p className="text-xs text-slate-400">
                Tasks deleted within the last 7 days can be restored anytime
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of deleted items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
              <span className="text-xs">Loading deleted tasks...</span>
            </div>
          ) : deletedTasks.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-slate-400 mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Trash is empty
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                No deleted tasks found. Any task you delete will appear here.
              </p>
            </div>
          ) : (
            deletedTasks.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 flex items-start justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {t.title}
                  </h4>
                  {t.description && (
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {t.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="capitalize px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {t.priority}
                    </span>
                    {t.deleted_at && (
                      <span>
                        Deleted on {new Date(t.deleted_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleRestore(t.id)}
                    disabled={actionLoadingId === t.id}
                    title="Restore task"
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition disabled:opacity-50"
                  >
                    {actionLoadingId === t.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="w-3.5 h-3.5" />
                    )}
                    <span>Restore</span>
                  </button>

                  <button
                    onClick={() => handlePermanentDelete(t.id)}
                    disabled={actionLoadingId === t.id}
                    title="Delete permanently"
                    className="p-1.5 text-xs rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center text-xs text-slate-400">
          <span>{deletedTasks.length} task(s) in trash</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
