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
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
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
      const response = await axios.get('/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.stats);
      setRecentLeaves(response.data.recentLeaves || []);
      setPendingRequests(response.data.pendingRequests || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Leaves',
      value: stats?.totalLeaves || 0,
      icon: CalendarIcon,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      to: '/leave-history'
    },
    {
      title: 'Pending',
      value: stats?.pendingLeaves || 0,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      to: user?.role === 'manager' ? '/team-requests' : '/leave-history'
    },
    {
      title: 'Approved',
      value: stats?.approvedLeaves || 0,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      to: '/leave-history'
    },
    {
      title: 'Rejected',
      value: stats?.rejectedLeaves || 0,
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

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
      {error}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="opacity-90">
          {user?.role === 'manager' 
            ? 'Manage your team leaves and approvals'
            : 'Track your leaves and apply for time off'}
        </p>
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
                {recentLeaves.slice(0, 5).map((leave) => (
                  <div key={leave.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{leave.leave_type} Leave</p>
                      <p className="text-sm text-gray-600">
                        {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      leave.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {leave.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent leaves</p>
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
                  {pendingRequests.slice(0, 5).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{request.employee_name}</p>
                        <p className="text-sm text-gray-600">
                          {request.leave_type} • {request.days} day(s)
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
                <p className="text-gray-500 text-center py-4">No pending approvals</p>
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
                      <ClockIcon className="h-5 w-5 text-white" />
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
    </div>
  );
};

export default Dashboard;