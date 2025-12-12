import api from './api';

export const login = (email, password) => {
  return api.post('/auth/login', { email, password });
};

export const getProfile = () => {
  return api.get('/auth/me');
};

export const updateProfile = (data) => {
  return api.put('/auth/update-profile', data);
};

export const changePassword = (data) => {
  return api.put('/auth/change-password', data);
};