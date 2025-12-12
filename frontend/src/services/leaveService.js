import axios from 'axios';
import authService from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL
});

// Add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const leaveService = {
  // Apply for leave
  applyLeave: async (leaveData) => {
    const response = await axiosInstance.post('/leaves', leaveData);
    return response.data;
  },

  // Get user's leaves
  getMyLeaves: async () => {
    const response = await axiosInstance.get('/leaves/my-leaves');
    return response.data;
  },

  // Get all leaves (for manager)
  getAllLeaves: async () => {
    const response = await axiosInstance.get('/leaves');
    return response.data;
  },

  // Get leaves for approval (manager)
  getPendingLeaves: async () => {
    const response = await axiosInstance.get('/leaves/pending');
    return response.data;
  },

  // Get team leaves
  getTeamLeaves: async () => {
    const response = await axiosInstance.get('/leaves/team');
    return response.data;
  },

  // Update leave status (approve/reject)
  updateLeaveStatus: async (leaveId, status, comment = '') => {
    const response = await axiosInstance.put(`/leaves/${leaveId}/status`, {
      status,
      comment
    });
    return response.data;
  },

  // Cancel leave
  cancelLeave: async (leaveId) => {
    const response = await axiosInstance.put(`/leaves/${leaveId}/cancel`);
    return response.data;
  },

  // Get leave balance
  getLeaveBalance: async () => {
    const response = await axiosInstance.get('/leaves/balance');
    return response.data;
  }
};

export default leaveService;