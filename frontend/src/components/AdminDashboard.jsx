import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  ListTodo,
  UserPlus,
  Trash2,
  Calendar,
  Search,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Eye,
  AlertCircle,
  Flag,
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

export default function AdminDashboard({ onBackToTasks }) {
  const { user, isMainAdmin } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'todos' | 'create_admin'
  const [users, setUsers] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected user for viewing specific todos
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTodos, setUserTodos] = useState([]);
  const [loadingUserTodos, setLoadingUserTodos] = useState(false);

  // Search & filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Create admin form
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allUsers, allTodos] = await Promise.all([
        api.adminGetAllUsers(),
        api.adminGetAllTodos(),
      ]);
      setUsers(allUsers || []);
      setTodos(allTodos || []);
    } catch (err) {
      toast.error('Failed to load admin data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleViewUserTodos = async (u) => {
    setSelectedUser(u);
    setLoadingUserTodos(true);
    try {
      const res = await api.adminGetUserTodos(u.id);
      setUserTodos(res || []);
    } catch (err) {
      toast.error('Failed to fetch user tasks: ' + err.message);
    } finally {
      setLoadingUserTodos(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.adminDeleteUser(userId);
      toast.success('User deleted successfully');
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      if (selectedUser?.id === userId) setSelectedUser(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete user');
    }
  };

  const handleDeleteTodo = async (userId, todoId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.adminDeleteTodo(userId, todoId);
      toast.success('Task deleted successfully');
      setTodos((prev) => prev.filter((t) => t.id !== todoId));
      setUserTodos((prev) => prev.filter((t) => t.id !== todoId));
    } catch (err) {
      toast.error(err.message || 'Failed to delete task');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!adminName || !adminEmail || !adminPass) {
      toast.error('All fields are required');
      return;
    }
    setIsCreatingAdmin(true);
    try {
      await api.adminCreateAdmin(adminName.trim(), adminEmail.trim(), adminPass);
      toast.success('New administrator created successfully!');
      setAdminName('');
      setAdminEmail('');
      setAdminPass('');
      setActiveTab('users');
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to create admin');
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  // Filtered todos
  const filteredTodos = todos.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.user_email && t.user_email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-800 text-white shadow-xl shadow-indigo-500/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight">Admin Console</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-white">
                  {isMainAdmin ? 'Super Admin' : 'Admin'}
                </span>
              </div>
              <p className="text-sm text-purple-100 mt-0.5">
                Manage global users, inspect all system tasks, and oversee application state
              </p>
            </div>
          </div>

          <button
            onClick={onBackToTasks}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-sm font-semibold text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Tasks</span>
          </button>
        </div>

        {/* Global Metric Summary */}
        <div className="mt-6 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-xs font-medium text-purple-200 uppercase tracking-wider">
              Total Users
            </div>
            <div className="text-2xl font-black mt-1">{users.length}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-purple-200 uppercase tracking-wider">
              Total System Tasks
            </div>
            <div className="text-2xl font-black mt-1">{todos.length}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-purple-200 uppercase tracking-wider">
              Admins
            </div>
            <div className="text-2xl font-black mt-1">
              {users.filter((u) => u.role === 'admin' || u.is_main_admin).length}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-purple-200 uppercase tracking-wider">
              Verified Users
            </div>
            <div className="text-2xl font-black mt-1">
              {users.filter((u) => u.is_verified).length}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 text-sm font-semibold">
        <button
          onClick={() => {
            setActiveTab('users');
            setSelectedUser(null);
          }}
          className={`pb-3 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Management ({users.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('todos');
            setSelectedUser(null);
          }}
          className={`pb-3 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'todos'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>All Tasks ({todos.length})</span>
        </button>

        {isMainAdmin && (
          <button
            onClick={() => {
              setActiveTab('create_admin');
              setSelectedUser(null);
            }}
            className={`pb-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'create_admin'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New Admin</span>
          </button>
        )}
      </div>

      {/* TAB 1: USERS */}
      {activeTab === 'users' && !selectedUser && (
        <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Created</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold uppercase">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {u.is_main_admin && (
                              <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                                Main Admin
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold capitalize ${
                          u.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          u.is_verified
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {u.is_verified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewUserTodos(u)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Tasks</span>
                        </button>
                        {!u.is_main_admin && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SPECIFIC USER TODOS VIEW */}
      {selectedUser && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedUser(null)}
              className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Back to All Users
            </button>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Tasks of {selectedUser.name} ({selectedUser.email})
            </div>
          </div>

          {loadingUserTodos ? (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
            </div>
          ) : userTodos.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-800 border text-center text-slate-400 text-sm">
              This user has no tasks yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {userTodos.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 flex items-start justify-between gap-3 shadow-xs"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {t.title}
                    </h4>
                    {t.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {t.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2 text-[11px]">
                      <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {t.status}
                      </span>
                      <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {t.priority}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTodo(selectedUser.id, t.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ALL TASKS */}
      {activeTab === 'todos' && (
        <div className="space-y-4">
          {/* Search & filter toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tasks or user email..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto text-xs font-semibold">
              {['all', 'pending', 'in_progress', 'completed'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition ${
                    statusFilter === s
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Tasks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredTodos.map((t) => (
              <div
                key={t.id || t.todo_id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 flex items-start justify-between gap-3 shadow-xs"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                      {t.user_name || t.user_email || 'User'}
                    </span>
                    <span className="text-[10px] text-slate-400">{t.user_email}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {t.title}
                  </h4>
                  {t.description && (
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {t.description}
                    </p>
                  )}
                  <div className="mt-2.5 flex items-center gap-2 text-[11px]">
                    <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {t.status}
                    </span>
                    <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {t.priority}
                    </span>
                    {t.due_date && (
                      <span className="text-slate-400">Due {t.due_date}</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTodo(t.user_id, t.id || t.todo_id)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CREATE ADMIN */}
      {activeTab === 'create_admin' && isMainAdmin && (
        <div className="max-w-md mx-auto p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Create New Administrator
              </h3>
              <p className="text-xs text-slate-400">
                Grant elevated administrative privileges
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Admin Full Name
              </label>
              <input
                type="text"
                required
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Admin Email Address
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Secure Password
              </label>
              <input
                type="password"
                required
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={isCreatingAdmin}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isCreatingAdmin && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Register New Admin</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
