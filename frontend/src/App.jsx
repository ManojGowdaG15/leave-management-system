import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ApplyLeave from './pages/ApplyLeave';
import LeaveHistory from './pages/LeaveHistory';
import TeamRequests from './pages/TeamRequests';
import TeamCalendar from './pages/TeamCalendar';
import LeaveBalance from './pages/LeaveBalance';
import authService from './services/auth'; // Changed from named import to default import
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = authService.getUser(); // Now using default import
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    authService.logout(); // Now using default import
    setUser(null);
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" />
      
      {user ? (
        <div className="min-h-screen bg-gray-50">
          {/* Mobile sidebar backdrop */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <Sidebar 
            isOpen={sidebarOpen} 
            user={user}
            onClose={() => setSidebarOpen(false)}
            onLogout={handleLogout}
          />

          {/* Main content */}
          <div className="lg:pl-64 flex flex-col min-h-screen">
            <Header 
              user={user} 
              toggleSidebar={() => setSidebarOpen(true)}
              onLogout={handleLogout}
            />
            
            <main className="flex-1 p-4 md:p-6">
              <Routes>
                <Route path="/" element={<Dashboard user={user} />} />
                <Route path="/apply-leave" element={<ApplyLeave user={user} />} />
                <Route path="/leave-history" element={<LeaveHistory user={user} />} />
                <Route path="/leave-balance" element={<LeaveBalance user={user} />} />
                
                {/* Manager-only routes */}
                {user.role === 'manager' && (
                  <>
                    <Route path="/team-requests" element={<TeamRequests user={user} />} />
                    <Route path="/team-calendar" element={<TeamCalendar user={user} />} />
                  </>
                )}
                
                {/* Redirect unauthorized access */}
                {user.role !== 'manager' && (
                  <>
                    <Route path="/team-requests" element={<Navigate to="/" />} />
                    <Route path="/team-calendar" element={<Navigate to="/" />} />
                  </>
                )}
                
                <Route path="/profile" element={
                  <div className="p-6 bg-white rounded-lg shadow">
                    <h1 className="text-2xl font-bold mb-4">Profile</h1>
                    <div className="space-y-3">
                      <p><strong>Name:</strong> {user.name}</p>
                      <p><strong>Email:</strong> {user.email}</p>
                      <p><strong>Role:</strong> <span className="capitalize">{user.role}</span></p>
                      <p><strong>Employee ID:</strong> {user.employeeId || 'N/A'}</p>
                    </div>
                  </div>
                } />
                
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            
            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-4 px-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-600 text-sm">
                  © 2025 Leave Management System
                </p>
                <p className="text-gray-500 text-xs mt-2 md:mt-0">
                  DataSturdy Consulting - Assignment
                </p>
              </div>
            </footer>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;