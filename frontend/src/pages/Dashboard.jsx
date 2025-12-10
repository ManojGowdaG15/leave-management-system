import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Users,
  FileText
} from 'lucide-react';
import { leaveService } from '../services/leave';
import { authService } from '../services/auth';

const Dashboard = () => {
  const [stats, setStats] = useState({
    leaveBalance: { casual_leaves: 0, sick_leaves: 0, earned_leaves: 0 },
    pendingLeaves: 0,
    approvedLeaves: 0,
    teamPending: 0,
    upcomingLeaves: []
  });
  const [loading, setLoading] = useState(true);
  const user = authService.getUser();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [balanceRes, historyRes] = await Promise.all([
        leaveService.getBalance(),
        leaveService.getHistory()
      ]);

      const pendingLeaves = historyRes.data?.filter(
        leave => leave.status === 'pending'
      ) || [];
      
      const approvedLeaves = historyRes.data?.filter(
        leave => leave.status === 'approved'
      ) || [];

      const upcomingLeaves = approvedLeaves.filter(leave => 
        new Date(leave.start_date) > new Date() &&
        new Date(leave.start_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      ).slice(0, 3);

      let teamPending = 0;
      if (user?.role === 'manager' || user?.role === 'admin') {
        try {
          const pendingRes = await leaveService.getPendingLeaves();
          teamPending = pendingRes.count || 0;
        } catch (error) {
          console.error('Failed to fetch team pending:', error);
        }
      }

      setStats({
        leaveBalance: balanceRes,
        pendingLeaves: pendingLeaves.length,
        approvedLeaves: approvedLeaves.length,
        teamPending,
        upcomingLeaves
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []); // Removed fetchDashboardData from dependencies

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-blue-100">
          Here's your leave management overview for today.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Leave Balance Card */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Leave Balance</h3>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Casual</span>
              <span className="text-2xl font-bold text-blue-600">
                {stats.leaveBalance.casual_leaves}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Sick</span>
              <span className="text-2xl font-bold text-green-600">
                {stats.leaveBalance.sick_leaves}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Earned</span>
              <span className="text-2xl font-bold text-purple-600">
                {stats.leaveBalance.earned_leaves}
              </span>
            </div>
          </div>
        </div>

        {/* Pending Leaves Card */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pending Leaves</h3>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
          <div className="text-center">
            <p className="text-5xl font-bold text-yellow-600 mb-2">
              {stats.pendingLeaves}
            </p>
            <p className="text-gray-500">Awaiting approval</p>
          </div>
        </div>

        {/* Approved Leaves Card */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Approved Leaves</h3>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <div className="text-center">
            <p className="text-5xl font-bold text-green-600 mb-2">
              {stats.approvedLeaves}
            </p>
            <p className="text-gray-500">This year</p>
          </div>
        </div>

        {/* Team Pending Card */}
        {(user?.role === 'manager' || user?.role === 'admin') && (
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Team Pending</h3>
              <Users className="h-8 w-8 text-red-500" />
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-red-600 mb-2">
                {stats.teamPending}
              </p>
              <p className="text-gray-500">Awaiting your action</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-3">
          <button 
            onClick={() => window.location.href = '/apply-leave'}
            className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
          >
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Apply for Leave</p>
                <p className="text-sm text-gray-500">Submit new leave request</p>
              </div>
            </div>
            <span className="text-blue-600">→</span>
          </button>

          <button 
            onClick={() => window.location.href = '/leave-history'}
            className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100"
          >
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">View History</p>
                <p className="text-sm text-gray-500">Check past leave applications</p>
              </div>
            </div>
            <span className="text-green-600">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;