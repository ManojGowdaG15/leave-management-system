import api from './api';

export const applyLeave = (data) => {
  return api.post('/leaves', data);
};

export const getMyLeaves = (params = {}) => {
  return api.get('/leaves/my-leaves', { params });
};

export const getLeaveById = (id) => {
  return api.get(`/leaves/${id}`);
};

export const updateLeave = (id, data) => {
  return api.put(`/leaves/${id}`, data);
};

export const cancelLeave = (id) => {
  return api.put(`/leaves/${id}/cancel`);
};

export const approveLeave = (id, action, comments) => {
  return api.put(`/leaves/${id}/action`, { action, comments });
};

export const getLeaveStats = () => {
  return api.get('/leaves/stats/summary');
};

export const getAllLeaves = (params = {}) => {
  return api.get('/leaves', { params });
};

export const getUpcomingLeaves = () => {
  return api.get('/leaves/upcoming/all');
};