import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  createSample: () => api.post('/auth/create-sample'),
};

// Leave services
export const leaveAPI = {
  applyLeave: (data) => api.post('/leaves/apply', data),
  getLeaveHistory: () => api.get('/leaves/history'),
  cancelLeave: (id) => api.put(`/leaves/cancel/${id}`),
};

// Manager services
export const managerAPI = {
  getPendingLeaves: () => api.get('/manager/pending-leaves'),
  approveLeave: (id, comments) => api.put(`/manager/approve-leave/${id}`, { comments }),
  rejectLeave: (id, comments) => api.put(`/manager/reject-leave/${id}`, { comments }),
  getTeamCalendar: () => api.get('/manager/team-calendar'),
};

// Employee services
export const employeeAPI = {
  getDashboard: () => api.get('/employee/dashboard'),
};

export default api;