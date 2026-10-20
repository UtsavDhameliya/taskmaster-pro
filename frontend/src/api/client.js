// API client for Todo List backend
const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function getAuthHeader() {
  const token = localStorage.getItem('todo_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // If unauthorized, clear token if expired
    if (response.status === 401 && !endpoint.includes('/login')) {
      // Don't auto-redirect on login fail, only on authenticated requests
      // localStorage.removeItem('todo_token');
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg =
        data?.detail ||
        data?.message ||
        (Array.isArray(data?.detail)
          ? data.detail.map((e) => e.msg).join(', ')
          : 'An unexpected error occurred');
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export const api = {
  // Auth & User
  register: (payload) =>
    request('/v1/user/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload) =>
    request('/v1/user/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => request('/v1/user/me'),

  updateProfile: (payload) =>
    request('/v1/user/update', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  sendEmailOtp: (email) =>
    request(`/v1/user/send_otp?email=${encodeURIComponent(email)}`, {
      method: 'POST',
    }),

  verifyEmailOtp: (email, otp) =>
    request(
      `/v1/user/verify_otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`,
      { method: 'POST' }
    ),

  sendForgotOtp: (email) =>
    request(
      `/v1/user/forget_password/send_otp?email=${encodeURIComponent(email)}`,
      { method: 'POST' }
    ),

  verifyForgotOtp: (email, otp, newPass) =>
    request(
      `/v1/user/forget_password/verify_otp?email=${encodeURIComponent(
        email
      )}&otp=${encodeURIComponent(otp)}&new_pass=${encodeURIComponent(newPass)}`,
      { method: 'POST' }
    ),

  resetPassword: (email, oldPass, newPass) =>
    request(
      `/v1/user/reset_password?email=${encodeURIComponent(
        email
      )}&old_pass=${encodeURIComponent(oldPass)}&new_pass=${encodeURIComponent(
        newPass
      )}`,
      { method: 'POST' }
    ),

  deleteAccount: (id, password) =>
    request(
      `/v1/user/delete?id=${encodeURIComponent(id)}&password=${encodeURIComponent(
        password
      )}`,
      { method: 'DELETE' }
    ),

  // Todos
  getTodos: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.priority && params.priority !== 'all') query.append('priority', params.priority);
    if (params.search) query.append('search', params.search);
    const qs = query.toString();
    return request(`/v1/Todo/all_task${qs ? `?${qs}` : ''}`);
  },

  getTodoById: (id) => request(`/v1/Todo/Todo_data/${id}`),

  createTodo: (payload) =>
    request('/v1/Todo/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateTodo: (id, payload) =>
    request(`/v1/Todo/Todo_update?todo_id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteTodo: (id) =>
    request(`/v1/Todo/delete_todo?todo_id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  getTrash: () => request('/v1/Todo/trash'),

  restoreTodo: (id) =>
    request(`/v1/Todo/restore_todo?todo_id=${encodeURIComponent(id)}`, {
      method: 'PUT',
    }),

  permanentDeleteTodo: (id) =>
    request(`/v1/Todo/permanent_delete/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  sendReminders: () =>
    request('/v1/Todo/send-reminder', {
      method: 'POST',
    }),

  // Admin
  adminLogin: (email, password) =>
    request(
      `/v1/admin/admin/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
      { method: 'POST' }
    ),

  adminGetAllUsers: () => request('/v1/admin/all_users'),

  adminGetAllTodos: () => request('/v1/admin/admin/todos'),

  adminGetUserTodos: (userId, params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.priority && params.priority !== 'all') query.append('priority', params.priority);
    const qs = query.toString();
    return request(`/v1/admin/users/${userId}/todos${qs ? `?${qs}` : ''}`);
  },

  adminCreateAdmin: (name, email, password) =>
    request(
      `/v1/admin/create?name=${encodeURIComponent(name)}&email=${encodeURIComponent(
        email
      )}&password=${encodeURIComponent(password)}`,
      { method: 'POST' }
    ),

  adminDeleteUser: (userId) =>
    request(`/v1/admin/admin/user/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    }),

  adminDeleteTodo: (userId, todoId) =>
    request(
      `/v1/admin/admin/user/${encodeURIComponent(userId)}/todo/${encodeURIComponent(
        todoId
      )}`,
      { method: 'DELETE' }
    ),
};
