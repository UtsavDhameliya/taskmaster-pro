import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import StatsOverview from './components/StatsOverview';
import TaskCard from './components/TaskCard';
import TaskModal from './components/TaskModal';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import TrashDrawer from './components/TrashDrawer';
import AdminDashboard from './components/AdminDashboard';
import { useAuth } from './context/AuthContext';
import { useToast } from './components/Toast';
import { api } from './api/client';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowUpDown,
  ListTodo,
  ShieldCheck,
  Bell,
  Loader2,
  Inbox,
} from 'lucide-react';

export default function App() {
  const { user, isAuthenticated, isAdmin, login } = useAuth();
  const toast = useToast();

  // State
  const [todos, setTodos] = useState([]);
  const [loadingTodos, setLoadingTodos] = useState(false);
  const [activeView, setActiveView] = useState('tasks'); // 'tasks' | 'admin'

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isTrashDrawerOpen, setIsTrashDrawerOpen] = useState(false);
  const [trashCount, setTrashCount] = useState(0);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_desc');

  // Reminders
  const [isSendingReminder, setIsSendingReminder] = useState(false);

  // Load Todos
  const loadTodos = useCallback(async () => {
    if (!isAuthenticated) {
      setTodos([]);
      return;
    }
    setLoadingTodos(true);
    try {
      const data = await api.getTodos({
        status: statusFilter,
        priority: priorityFilter,
        search: searchQuery,
      });
      setTodos(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load tasks: ' + err.message);
    } finally {
      setLoadingTodos(false);
    }
  }, [isAuthenticated, statusFilter, priorityFilter, searchQuery]);

  // Load Trash count
  const loadTrashCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const trash = await api.getTrash();
      setTrashCount(trash?.length || 0);
    } catch (err) {
      // ignore
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadTodos();
    loadTrashCount();
  }, [loadTodos, loadTrashCount]);

  // Save Task (Create or Update)
  const handleSaveTask = async (payload) => {
    try {
      if (editingTask) {
        await api.updateTodo(editingTask.id, payload);
        toast.success('Task updated successfully!');
      } else {
        await api.createTodo(payload);
        toast.success('Task created successfully!');
      }
      setIsTaskModalOpen(false);
      setEditingTask(null);
      await loadTodos();
    } catch (err) {
      toast.error(err.message || 'Failed to save task');
    }
  };

  // Toggle status inline
  const handleToggleStatus = async (todoId, newStatus) => {
    // Optimistic UI update
    setTodos((prev) =>
      prev.map((t) => (t.id === todoId ? { ...t, status: newStatus } : t))
    );

    try {
      await api.updateTodo(todoId, { status: newStatus });
      toast.success(
        newStatus === 'completed'
          ? '🎉 Task completed!'
          : 'Task marked as pending'
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
      await loadTodos();
    }
  };

  // Delete task (soft delete)
  const handleDeleteTask = async (todoId) => {
    try {
      await api.deleteTodo(todoId);
      toast.info('Task moved to Trash');
      await loadTodos();
      await loadTrashCount();
    } catch (err) {
      toast.error(err.message || 'Failed to delete task');
    }
  };

  // Send reminders
  const handleSendReminders = async () => {
    setIsSendingReminder(true);
    try {
      const res = await api.sendReminders();
      toast.success(res.message || 'Reminders dispatched!');
    } catch (err) {
      toast.error(err.message || 'Failed to send reminders');
    } finally {
      setIsSendingReminder(false);
    }
  };

  // Quick Demo Login
  const handleQuickDemoLogin = async () => {
    try {
      await login('dhameliyautsav08@gmail.com', 'Admin123!');
      toast.success('Signed in as Admin!');
    } catch (err) {
      // If password changed, open modal
      openAuth('login');
    }
  };

  const openAuth = (tab = 'login') => {
    setAuthInitialTab(tab);
    setIsAuthModalOpen(true);
  };

  // Sort todos
  const sortedTodos = [...todos].sort((a, b) => {
    if (sortBy === 'created_desc') {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    if (sortBy === 'created_asc') {
      return new Date(a.created_at) - new Date(b.created_at);
    }
    if (sortBy === 'due_date') {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    }
    if (sortBy === 'priority') {
      const weights = { high: 3, medium: 2, low: 1 };
      return (weights[b.priority] || 0) - (weights[a.priority] || 0);
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col font-sans">
      {/* Navbar */}
      <Navbar
        onOpenAuth={openAuth}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenTrash={() => setIsTrashDrawerOpen(true)}
        onOpenAdmin={() => setActiveView('admin')}
        activeView={activeView}
        setActiveView={setActiveView}
        trashCount={trashCount}
        onSendReminders={handleSendReminders}
        isSendingReminder={isSendingReminder}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isAuthenticated ? (
          /* HERO WELCOME SCREEN FOR GUESTS */
          <div className="py-12 sm:py-20 flex flex-col items-center text-center max-w-3xl mx-auto space-y-8 animate-in fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300 shadow-xs">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Full-Stack Task Management & Productivity System</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Organize everything.{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 bg-clip-text text-transparent">
                Achieve anything.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              Clean, powerful, and delightfully responsive. Manage tasks, set priorities, track due dates, recover deleted items from trash, and receive smart automated email reminders.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => openAuth('register')}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create Free Account</span>
              </button>
              <button
                onClick={() => openAuth('login')}
                className="px-6 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-bold text-sm text-slate-700 dark:text-slate-200 shadow-xs transition"
              >
                Sign In
              </button>
            </div>

            {/* Feature highlights grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 w-full text-left">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                  <ListTodo className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 mb-1">
                  Smart Task Prioritization
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Categorize by priority, set due dates, and filter instantly with one click.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 mb-1">
                  Trash & Safe Recovery
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Deleted a task by mistake? Restore any soft-deleted item safely within 7 days.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 mb-1">
                  Admin Control Center
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Complete administrative visibility across all platform users, roles, and tasks.
                </p>
              </div>
            </div>
          </div>
        ) : activeView === 'admin' && isAdmin ? (
          /* ADMIN PORTAL */
          <AdminDashboard onBackToTasks={() => setActiveView('tasks')} />
        ) : (
          /* AUTHENTICATED USER DASHBOARD */
          <div className="space-y-6">
            {/* Stats Overview banner */}
            <StatsOverview todos={todos} />

            {/* Action Bar (Search, Filters, New Task Button) */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
              {/* Search input */}
              <div className="relative w-full lg:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks by title or notes..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              {/* Status & Priority Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                {/* Status Tabs */}
                <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'pending', label: 'Pending' },
                    { id: 'in_progress', label: 'In Progress' },
                    { id: 'completed', label: 'Completed' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStatusFilter(s.id)}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        statusFilter === s.id
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Priority Selector */}
                <div className="flex items-center gap-1.5">
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden"
                  >
                    <option value="all">Priority: All</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden"
                  >
                    <option value="created_desc">Newest First</option>
                    <option value="created_asc">Oldest First</option>
                    <option value="due_date">Due Date</option>
                    <option value="priority">Priority</option>
                    <option value="title">Title (A-Z)</option>
                  </select>
                </div>

                {/* New Task Button */}
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setIsTaskModalOpen(true);
                  }}
                  className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 transition shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>New Task</span>
                </button>
              </div>
            </div>

            {/* Task Cards Grid */}
            {loadingTodos ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
                <span className="text-sm font-medium">Loading your tasks...</span>
              </div>
            ) : sortedTodos.length === 0 ? (
              <div className="py-20 text-center p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-500 mb-4">
                  <Inbox className="w-7 h-7 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                    ? 'No matching tasks found'
                    : 'No tasks on your list yet!'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-5">
                  {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                    ? 'Try adjusting your search filters to find what you are looking for.'
                    : 'Create your first task to kickstart your day with focus and clarity.'}
                </p>
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setIsTaskModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Your First Task</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedTodos.map((todo) => (
                  <TaskCard
                    key={todo.id}
                    todo={todo}
                    onToggleStatus={handleToggleStatus}
                    onEdit={(t) => {
                      setEditingTask(t);
                      setIsTaskModalOpen(true);
                    }}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TaskMaster Pro &bull; Complete Full-Stack Todo System</span>
          <span className="flex items-center gap-1 text-slate-500">
            FastAPI Backend + React Frontend &bull; Fully Connected
          </span>
        </div>
      </footer>

      {/* MODALS */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        task={editingTask}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authInitialTab}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <TrashDrawer
        isOpen={isTrashDrawerOpen}
        onClose={() => setIsTrashDrawerOpen(false)}
        onTaskRestored={async () => {
          await loadTodos();
          await loadTrashCount();
        }}
      />
    </div>
  );
}
