import apiClient from './axiosConfig';
import toast from 'react-hot-toast';

export const leaveService = {
  // Get leave balance
  async getBalance() {
    try {
      const response = await apiClient.get('/leave/balance');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to fetch leave balance');
      throw error;
    }
  },

  // Apply for leave
  async applyLeave(data) {
    try {
      const response = await apiClient.post('/leave/apply', data);
      toast.success(response.data.message || 'Leave application submitted successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to apply for leave');
      throw error;
    }
  },

  // Get leave history
  async getHistory() {
    try {
      const response = await apiClient.get('/leave/history');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to fetch leave history');
      throw error;
    }
  },

  // Cancel pending leave
  async cancelLeave(id) {
    try {
      const response = await apiClient.put(`/leave/cancel/${id}`);
      toast.success(response.data.message || 'Leave cancelled successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel leave');
      throw error;
    }
  },

  // Get pending leaves (for managers)
  async getPendingLeaves() {
    try {
      const response = await apiClient.get('/leave/pending');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to fetch pending leaves');
      throw error;
    }
  },

  // Approve/reject leave
  async approveLeave(id, data) {
    try {
      const response = await apiClient.put(`/leave/approve/${id}`, data);
      toast.success(response.data.message || 'Leave action completed successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to process leave request');
      throw error;
    }
  },

  // Get team calendar
  async getTeamCalendar() {
    try {
      const response = await apiClient.get('/leave/team-calendar');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to fetch team calendar');
      throw error;
    }
  }
};