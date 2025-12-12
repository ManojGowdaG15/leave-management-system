import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import authService from '../../services/authService';

const RoleBasedRoute = ({ allowedRoles }) => {
  const user = authService.getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }
  
  return <Outlet />;
};

export default RoleBasedRoute;