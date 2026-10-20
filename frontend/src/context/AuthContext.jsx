import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('todo_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('todo_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Sync token & user from backend on initial mount
  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const profile = await api.getMe();
          setUser(profile);
          localStorage.setItem('todo_user', JSON.stringify(profile));
        } catch (err) {
          console.warn('Session expired or invalid:', err);
          // Only clear if 401
          if (err.message && err.message.toLowerCase().includes('credential')) {
            logout();
          }
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    const jwt = res.token;
    localStorage.setItem('todo_token', jwt);
    setToken(jwt);

    if (res.user) {
      setUser(res.user);
      localStorage.setItem('todo_user', JSON.stringify(res.user));
    } else {
      const profile = await api.getMe();
      setUser(profile);
      localStorage.setItem('todo_user', JSON.stringify(profile));
    }
    return res;
  };

  const register = async (name, email, password) => {
    const res = await api.register({ name, email, password });
    // After registration, auto log in
    return await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('todo_token');
    localStorage.removeItem('todo_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const profile = await api.getMe();
      setUser(profile);
      localStorage.setItem('todo_user', JSON.stringify(profile));
      return profile;
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const updateUser = (updated) => {
    setUser((prev) => {
      const next = { ...prev, ...updated };
      localStorage.setItem('todo_user', JSON.stringify(next));
      return next;
    });
  };

  const isAdmin = user?.role === 'admin' || user?.is_main_admin === true;
  const isMainAdmin = user?.is_main_admin === true;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: !!token && !!user,
        isAdmin,
        isMainAdmin,
        login,
        register,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
