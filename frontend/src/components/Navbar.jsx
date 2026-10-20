import React from 'react';
import {
  CheckSquare,
  Sun,
  Moon,
  Trash2,
  ShieldCheck,
  Bell,
  User,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({
  onOpenAuth,
  onOpenProfile,
  onOpenTrash,
  onOpenAdmin,
  activeView,
  setActiveView,
  trashCount = 0,
  onSendReminders,
  isSendingReminder = false,
}) {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => setActiveView('tasks')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <CheckSquare className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 bg-clip-text text-transparent">
                TaskMaster
              </span>
              <span className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                Pro
              </span>
            </div>
          </div>

          {/* Navigation items for desktop */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1.5 pl-4 border-l border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setActiveView('tasks')}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
                  activeView === 'tasks'
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                My Tasks
              </button>

              <button
                onClick={() => onOpenTrash()}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
                  activeView === 'trash'
                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>Trash</span>
                {trashCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 text-xs font-bold rounded-full bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                    {trashCount}
                  </span>
                )}
              </button>

              {isAdmin && (
                <button
                  onClick={() => onOpenAdmin()}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition ${
                    activeView === 'admin'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300'
                      : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Panel</span>
                </button>
              )}
            </nav>
          )}
        </div>

        {/* Right Action controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Email Reminders Button */}
          {isAuthenticated && (
            <button
              onClick={onSendReminders}
              disabled={isSendingReminder}
              title="Send email reminders for tomorrow's due tasks"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition disabled:opacity-50"
            >
              <Bell className={`w-3.5 h-3.5 ${isSendingReminder ? 'animate-bounce' : ''}`} />
              <span className="hidden sm:inline">Reminders</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* User profile / Auth Button */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm">
                  {user?.name ? user.name.charAt(0) : 'U'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                    {user?.is_main_admin
                      ? 'Main Admin'
                      : user?.role === 'admin'
                      ? 'Admin'
                      : 'Member'}
                  </span>
                </div>
              </button>

              <button
                onClick={logout}
                title="Sign out"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Get Started</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
