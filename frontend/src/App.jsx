import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import './App.css';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/employee" element={
                        <PrivateRoute allowedRoles={['employee', 'manager', 'admin']}>
                            <EmployeeDashboard />
                        </PrivateRoute>
                    } />
                    <Route path="/manager" element={
                        <PrivateRoute allowedRoles={['manager', 'admin']}>
                            <ManagerDashboard />
                        </PrivateRoute>
                    } />
                    <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;