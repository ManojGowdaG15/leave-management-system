import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
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
    
    const message = error.response?.data?.error || error.message || 'Something went wrong';
    return Promise.reject({ message, status: error.response?.status });
  }
);

// Auth services
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  createSampleUsers: () => api.post('/auth/create-sample'),
};

// Leave services
export const leaveAPI = {
  applyLeave: (data) => api.post('/leaves/apply', data),
  getLeaveHistory: () => api.get('/leaves/history'),
  cancelLeave: (id) => api.put(`/leaves/cancel/${id}`),
  getLeaveById: (id) => api.get(`/leaves/${id}`),
};

// Employee services
export const employeeAPI = {
  getDashboard: () => api.get('/employee/dashboard'),
  getLeaveBalance: () => api.get('/employee/leave-balance'),
  getPendingLeaves: () => api.get('/employee/pending-leaves'),
};

// Manager services
export const managerAPI = {
  getPendingLeaves: () => api.get('/manager/pending-leaves'),
  approveLeave: (id, comments) => api.put(`/manager/approve-leave/${id}`, { comments }),
  rejectLeave: (id, comments) => api.put(`/manager/reject-leave/${id}`, { comments }),
  getTeamCalendar: () => api.get('/manager/team-calendar'),
  getTeamOverview: () => api.get('/manager/team-overview'),
  getPendingExpenses: () => api.get('/manager/pending-expenses'),
};

export default api;