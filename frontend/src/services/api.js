import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (email, password) => 
  api.post('/auth/login', { email, password });

export const getCurrentUser = () => 
  api.get('/auth/me');

export const applyLeave = (leaveData) => 
  api.post('/leave/apply', leaveData);

export const getMyApplications = () => 
  api.get('/leave/my-applications');

export const getMyBalance = () => 
  api.get('/leave/my-balance');

export const cancelLeave = (leaveId) => 
  api.patch(`/leave/cancel/${leaveId}`);

export const getTeamRequests = () => 
  api.get('/leave/team-requests');

export const manageLeave = (leaveId, status, comments) => 
  api.patch(`/leave/manage/${leaveId}`, { status, managerComments: comments });

export const getTeamCalendar = () => 
  api.get('/leave/team-calendar');

export default api;