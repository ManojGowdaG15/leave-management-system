import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import components
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import EmployeeDashboard from './pages/Employee/Dashboard';
import ApplyLeave from './pages/Employee/ApplyLeave';
import LeaveHistory from './pages/Employee/LeaveHistory';
import LeaveBalance from './pages/Employee/LeaveBalance';
import ManagerDashboard from './pages/Manager/Dashboard';
import TeamLeaves from './pages/Manager/TeamLeaves';

// Create Protected Route component
const ProtectedRoute = ({ children, roles = [] }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" />;
  }

  // Check if user has required role
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes - Employee */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <EmployeeDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/apply-leave" element={
            <ProtectedRoute>
              <ApplyLeave />
            </ProtectedRoute>
          } />
          
          <Route path="/leave-history" element={
            <ProtectedRoute>
              <LeaveHistory />
            </ProtectedRoute>
          } />
          
          <Route path="/leave-balance" element={
            <ProtectedRoute>
              <LeaveBalance />
            </ProtectedRoute>
          } />
          
          {/* Protected Routes - Manager */}
          <Route path="/manager/dashboard" element={
            <ProtectedRoute roles={['manager', 'admin']}>
              <ManagerDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/manager/team-leaves" element={
            <ProtectedRoute roles={['manager', 'admin']}>
              <TeamLeaves />
            </ProtectedRoute>
          } />
          
          {/* Default route */}
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;