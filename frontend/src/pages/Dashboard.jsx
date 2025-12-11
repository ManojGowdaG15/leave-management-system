import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import Loader from '../components/common/Loader';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return <Loader fullScreen />;
  }

  // Redirect based on role
  if (user?.role === 'employee') {
    return <Navigate to="/employee" replace />;
  } else if (user?.role === 'manager' || user?.role === 'admin') {
    return <Navigate to="/manager" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Sidebar isOpen={sidebarOpen} />
      
      <div className="lg:pl-64">
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Leave Management System
              </h1>
              <p className="text-gray-600 mb-8">
                Loading your dashboard...
              </p>
              <Loader fullScreen={false} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;