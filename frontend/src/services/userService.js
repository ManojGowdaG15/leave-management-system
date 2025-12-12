import api from './api';

export const getAllUsers = () => {
  return api.get('/users');
};

export const getUserById = (id) => {
  return api.get(`/users/${id}`);
};

export const updateUser = (id, data) => {
  return api.put(`/users/${id}`, data);
};

export const getTeamMembers = () => {
  return api.get('/users/team/members');
};