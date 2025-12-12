import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import PrivateRoute from './components/PrivateRoute';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-50">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    
                    {/* Protected Routes */}
                    <Route path="/employee/*" element={
                        <PrivateRoute allowedRoles={['employee']}>
                            <EmployeeDashboard />
                        </PrivateRoute>
                    } />
                    
                    <Route path="/manager/*" element={
                        <PrivateRoute allowedRoles={['manager']}>
                            <ManagerDashboard />
                        </PrivateRoute>
                    } />
                    
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
                <ToastContainer position="top-right" />
            </div>
        </Router>
    );
}

export default App;