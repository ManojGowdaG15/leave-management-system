import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  CalendarIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalLeaves: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0
  });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Dashboard response:', response.data);
      
      // Set stats
      if (response.data.stats) {
        setStats(response.data.stats);
      }
      
      // Set recent leaves
      if (response.data.recentLeaves) {
        const mappedLeaves = response.data.recentLeaves.map(leave => ({
          id: leave._id,
          leave_type: leave.leaveType,
          start_date: leave.startDate,
          end_date: leave.endDate,
          status: leave.status,
          reason: leave.reason,
          employee_name: leave.employee_name,
          applied_date: leave.appliedDate
        }));
        setRecentLeaves(mappedLeaves);
      }
      
      // Set pending requests for managers
      if (response.data.pendingRequests) {
        const mappedRequests = response.data.pendingRequests.map(request => ({
          id: request._id,
          employee_name: request.employee_name,
          employee_email: request.employee_email,
          leave_type: request.leaveType,
          days: request.days,
          start_date: request.startDate,
          end_date: request.endDate,
          reason: request.reason
        }));
        setPendingRequests(mappedRequests);
      }
      
      // Set leave balance for employees
      if (response.data.leaveBalance) {
        setLeaveBalance(response.data.leaveBalance);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Dashboard error:', err.response || err);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Leaves',
      value: stats.totalLeaves,
      icon: CalendarIcon,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      to: '/leave-history'
    },
    {
      title: 'Pending',
      value: stats.pendingLeaves,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      to: user?.role === 'manager' ? '/team-requests' : '/leave-history'
    },
    {
      title: 'Approved',
      value: stats.approvedLeaves,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      to: '/leave-history'
    },
    {
      title: 'Rejected',
      value: stats.rejectedLeaves,
      icon: XCircleIcon,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      to: '/leave-history'
    }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p className="opacity-90">
              {user?.role === 'manager' 
                ? 'Manage your team leaves and approvals'
                : 'Track your leaves and apply for time off'}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex items-center bg-blue-700 bg-opacity-50 rounded-lg px-4 py-2">
              <UsersIcon className="h-5 w-5 mr-2" />
              <span className="capitalize">{user?.role || 'Employee'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Balance for Employees */}
      {user?.role === 'employee' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Casual Leaves</p>
                <h3 className="text-2xl font-bold text-blue-600">
                  {leaveBalance.casualLeaves || 12} days
                </h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Sick Leaves</p>
                <h3 className="text-2xl font-bold text-yellow-600">
                  {leaveBalance.sickLeaves || 10} days
                </h3>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Earned Leaves</p>
                <h3 className="text-2xl font-bold text-green-600">
                  {leaveBalance.earnedLeaves || 15} days
                </h3>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Link 
            key={index} 
            to={stat.to}
            className="block"
          >
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    {stat.title}
                  </p>
                  <h3 className={`text-2xl font-bold ${stat.textColor}`}>
                    {stat.value}
                  </h3>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leaves */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h5 className="font-bold flex items-center text-gray-800">
              <ClockIcon className="h-5 w-5 mr-2" />
              Recent Leave Applications
            </h5>
          </div>
          <div className="p-4">
            {recentLeaves.length > 0 ? (
              <div className="space-y-4">
                {recentLeaves.map((leave, index) => (
                  <div key={leave.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">
                            {leave.leave_type} Leave
                            {leave.employee_name && (
                              <span className="text-sm text-gray-600 ml-2">({leave.employee_name})</span>
                            )}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          leave.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {leave.status || 'Pending'}
                        </span>
                      </div>
                      {leave.reason && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-1">{leave.reason}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No recent leaves found</p>
                <Link to="/apply-leave" className="text-blue-600 hover:underline mt-2 inline-block">
                  Apply for your first leave
                </Link>
              </div>
            )}
            <div className="mt-4 text-center">
              <Link to="/leave-history" className="text-blue-600 hover:underline">
                View all leaves →
              </Link>
            </div>
          </div>
        </div>

        {/* Manager-specific or Employee-specific */}
        {user?.role === 'manager' ? (
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h5 className="font-bold flex items-center text-gray-800">
                <UserGroupIcon className="h-5 w-5 mr-2" />
                Pending Approvals ({pendingRequests.length})
              </h5>
            </div>
            <div className="p-4">
              {pendingRequests.length > 0 ? (
                <div className="space-y-4">
                  {pendingRequests.map((request, index) => (
                    <div key={request.id || index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{request.employee_name}</p>
                        <p className="text-sm text-gray-600">
                          {request.leave_type} • {request.days} day(s)
                        </p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                          {request.reason}
                        </p>
                      </div>
                      <Link 
                        to="/team-requests"
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors whitespace-nowrap ml-4"
                      >
                        Review
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircleIcon className="h-12 w-12 text-green-300 mx-auto mb-3" />
                  <p className="text-gray-500">No pending approvals</p>
                  <p className="text-sm text-gray-400 mt-1">All caught up!</p>
                </div>
              )}
              <div className="mt-4 text-center">
                <Link to="/team-requests" className="text-blue-600 hover:underline">
                  Manage all requests →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h5 className="font-bold flex items-center text-gray-800">
                <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
                Quick Actions
              </h5>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <Link 
                  to="/apply-leave"
                  className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-600 rounded-lg mr-3">
                      <CalendarIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Apply for Leave</p>
                      <p className="text-sm text-gray-600">Submit a new leave request</p>
                    </div>
                  </div>
                  <span className="text-blue-600">→</span>
                </Link>
                
                <Link 
                  to="/leave-balance"
                  className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-green-600 rounded-lg mr-3">
                      <CalendarDaysIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Check Leave Balance</p>
                      <p className="text-sm text-gray-600">View available leaves</p>
                    </div>
                  </div>
                  <span className="text-green-600">→</span>
                </Link>

                <Link 
                  to="/leave-history"
                  className="flex items-center justify-between p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-600 rounded-lg mr-3">
                      <ClockIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">View Leave History</p>
                      <p className="text-sm text-gray-600">Check past applications</p>
                    </div>
                  </div>
                  <span className="text-purple-600">→</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h5 className="font-bold text-gray-800 mb-4">Leave Management Tips</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h6 className="font-semibold text-gray-800 mb-2">Plan Ahead</h6>
            <p className="text-sm text-gray-600">
              Apply for leaves at least 2 days in advance for better approval chances.
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h6 className="font-semibold text-gray-800 mb-2">Check Balance</h6>
            <p className="text-sm text-gray-600">
              Regularly monitor your leave balance to avoid surprises.
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h6 className="font-semibold text-gray-800 mb-2">Documentation</h6>
            <p className="text-sm text-gray-600">
              Keep necessary documents ready for sick leaves beyond 2 days.
            </p>
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <p className="text-yellow-700 text-sm">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;