import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Calendar, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import StatsCard from '../components/common/StatsCard';
import LeaveCard from '../components/common/LeaveCard';
import ApplyLeave from '../components/employee/ApplyLeave';
import LeaveHistory from '../components/employee/LeaveHistory';
import LeaveBalance from '../components/employee/LeaveBalance';
import { employeeAPI, leaveAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import Loader from '../components/common/Loader';

const EmployeeDashboard = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentLeaves, setRecentLeaves] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, leavesRes] = await Promise.all([
        employeeAPI.getDashboard(),
        leaveAPI.getLeaveHistory(),
      ]);
      
      setDashboardData(dashboardRes.data.data);
      setRecentLeaves(leavesRes.data.data.slice(0, 3));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/apply-leave')) return 'Apply Leave';
    if (path.includes('/leave-history')) return 'Leave History';
    if (path.includes('/leave-balance')) return 'Leave Balance';
    return 'Dashboard';
  };

  const getPageDescription = () => {
    const path = location.pathname;
    if (path.includes('/apply-leave')) return 'Submit a new leave request';
    if (path.includes('/leave-history')) return 'View and manage your leave applications';
    if (path.includes('/leave-balance')) return 'Track your available leave balance';
    return 'Overview of your leave management';
  };

  if (loading && location.pathname === '/employee') {
    return <Loader fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Sidebar isOpen={sidebarOpen} />
      
      <div className="lg:pl-64">
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
              <p className="text-gray-600">{getPageDescription()}</p>
            </div>

            <Routes>
              <Route path="/" element={
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                      title="Casual Leave"
                      value={dashboardData?.user?.leaveBalance?.casual || 0}
                      icon={Calendar}
                      color="blue"
                      subtitle="Available days"
                    />
                    <StatsCard
                      title="Sick Leave"
                      value={dashboardData?.user?.leaveBalance?.sick || 0}
                      icon={TrendingUp}
                      color="red"
                      subtitle="Available days"
                    />
                    <StatsCard
                      title="Earned Leave"
                      value={dashboardData?.user?.leaveBalance?.earned || 0}
                      icon={CheckCircle}
                      color="green"
                      subtitle="Available days"
                    />
                    <StatsCard
                      title="Pending Approvals"
                      value={dashboardData?.stats?.pendingLeaves || 0}
                      icon={Clock}
                      color="yellow"
                      subtitle="Awaiting approval"
                    />
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="card">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <button
                          onClick={() => window.location.href = '/employee/apply-leave'}
                          className="w-full flex items-center justify-center btn-primary py-3"
                        >
                          <Calendar className="h-5 w-5 mr-2" />
                          Apply for Leave
                        </button>
                        <button
                          onClick={() => window.location.href = '/employee/leave-balance'}
                          className="w-full flex items-center justify-center btn-secondary py-3"
                        >
                          <TrendingUp className="h-5 w-5 mr-2" />
                          Check Leave Balance
                        </button>
                      </div>
                    </div>

                    {/* Recent Leaves */}
                    <div className="lg:col-span-2">
                      <div className="card">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-gray-900">Recent Leave Applications</h3>
                          <button
                            onClick={() => window.location.href = '/employee/leave-history'}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            View All →
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          {recentLeaves.length === 0 ? (
                            <div className="text-center py-8">
                              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-600">No recent leave applications</p>
                            </div>
                          ) : (
                            recentLeaves.map((leave) => (
                              <LeaveCard
                                key={leave._id}
                                leave={leave}
                                onViewDetails={() => window.location.href = '/employee/leave-history'}
                              />
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Leave Calendar Preview */}
                  <div className="card mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Time Off</h3>
                    <div className="space-y-3">
                      {recentLeaves
                        .filter(leave => leave.status === 'approved' && new Date(leave.startDate) >= new Date())
                        .slice(0, 3)
                        .map((leave) => (
                          <div key={leave._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                <Calendar className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 capitalize">{leave.leaveType} Leave</p>
                                <p className="text-sm text-gray-600">
                                  {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">{leave.daysCount} days</p>
                              <span className="badge-success">Approved</span>
                            </div>
                          </div>
                        ))}
                      
                      {recentLeaves.filter(leave => leave.status === 'approved' && new Date(leave.startDate) >= new Date()).length === 0 && (
                        <div className="text-center py-8">
                          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No upcoming time off scheduled</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              } />
              
              <Route path="/apply-leave" element={<ApplyLeave />} />
              <Route path="/leave-history" element={<LeaveHistory />} />
              <Route path="/leave-balance" element={<LeaveBalance />} />
              
              <Route path="*" element={<Navigate to="/employee" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;