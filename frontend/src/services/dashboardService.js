import api from './api';

export const dashboardService = {
  // Simple dashboard - always works
  getSimpleDashboard: async () => {
    try {
      const response = await api.get('/dashboard/employee-simple');
      return response.data;
    } catch (error) {
      console.error('Simple dashboard error:', error);
      throw error;
    }
  }
};