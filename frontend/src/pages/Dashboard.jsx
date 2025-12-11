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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStats(response.data.stats || {
        totalLeaves: 0,
        pendingLeaves: 0,
        approvedLeaves: 0,
        rejectedLeaves: 0
      });
      
      setRecentLeaves(response.data.recentLeaves || []);
      setPendingRequests(response.data.pendingRequests || []);
      setLoading(false);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
      setLoading(false);
      
      // Set dummy data for development
      setStats({
        totalLeaves: 5,
        pendingLeaves: 2,
        approvedLeaves: 3,
        rejectedLeaves: 0
      });
      setRecentLeaves([
        { id: 1, leave_type: 'Casual', start_date: '2024-12-15', end_date: '2024-12-16', status: 'Approved' },
        { id: 2, leave_type: 'Sick', start_date: '2024-12-20', end_date: '2024-12-21', status: 'Pending' }
      ]);
      if (user?.role === 'manager') {
        setPendingRequests([
          { id: 1, employee_name: 'John Doe', leave_type: 'Casual', days: 2 }
        ]);
      }
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

  if (loading) return (
    <div className="text-center py-12">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-600">Loading dashboard...</p>
    </div>
  );

  if (error && !stats.totalLeaves) return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
      <h3 className="font-bold mb-2">Error Loading Dashboard</h3>
      <p>{error}</p>
      <p className="text-sm mt-2">Using sample data for demonstration.</p>
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
                    <div>
                      <p className="font-medium text-gray-800">{leave.leave_type} Leave</p>
                      <p className="text-sm text-gray-600">
                        {new Date(leave.start_date).toLocaleDateString('en-US', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })} - {new Date(leave.end_date).toLocaleDateString('en-US', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      leave.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {leave.status || 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No recent leaves found</p>
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
                Pending Approvals
              </h5>
            </div>
            <div className="p-4">
              {pendingRequests.length > 0 ? (
                <div className="space-y-4">
                  {pendingRequests.map((request, index) => (
                    <div key={request.id || index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{request.employee_name || 'Team Member'}</p>
                        <p className="text-sm text-gray-600">
                          {request.leave_type || 'Leave'} • {request.days || 1} day(s)
                        </p>
                      </div>
                      <Link 
                        to="/team-requests"
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
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
                Note: Dashboard is showing sample data. Backend integration is in progress.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;