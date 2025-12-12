import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const authService = {
  // Register user
  register: async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Check user role
  hasRole: (role) => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.role === role;
  },

  // Check if user is manager or admin
  isManagerOrAdmin: () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.role === 'manager' || user?.role === 'admin';
  }
};

// Make sure this line is present:
export default authService;