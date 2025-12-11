import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Users, CheckCircle, Clock, AlertCircle, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import StatsCard from '../components/common/StatsCard';
import PendingApprovals from '../components/manager/PendingApprovals';
import TeamCalendar from '../components/manager/TeamCalendar';
import TeamOverview from '../components/manager/TeamOverview';
import { managerAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import Loader from '../components/common/Loader';

const ManagerDashboard = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [teamStats, setTeamStats] = useState({
    totalEmployees: 0,
    onLeaveToday: 0,
    pendingApprovals: 0,
    approvalRate: '0%',
  });
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [pendingRes, overviewRes] = await Promise.all([
        managerAPI.getPendingLeaves(),
        managerAPI.getTeamOverview(),
      ]);
      
      setPendingLeaves(pendingRes.data.data);
      setDashboardData(overviewRes.data.data);
      
      // Calculate team stats
      const stats = {
        totalEmployees: overviewRes.data.data.employees?.length || 0,
        onLeaveToday: Math.floor(Math.random() * 5), // Placeholder - would come from API
        pendingApprovals: pendingRes.data.count || 0,
        approvalRate: '92%', // Placeholder
      };
      setTeamStats(stats);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/pending-approvals')) return 'Pending Approvals';
    if (path.includes('/team-calendar')) return 'Team Calendar';
    if (path.includes('/team-overview')) return 'Team Overview';
    if (path.includes('/expenses')) return 'Expense Claims';
    return 'Dashboard';
  };

  const getPageDescription = () => {
    const path = location.pathname;
    if (path.includes('/pending-approvals')) return 'Review and manage leave requests';
    if (path.includes('/team-calendar')) return 'View team schedule and time off';
    if (path.includes('/team-overview')) return 'Monitor team performance and analytics';
    if (path.includes('/expenses')) return 'Manage expense claims and approvals';
    return 'Overview of team leave management';
  };

  if (loading && location.pathname === '/manager') {
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
                      title="Team Members"
                      value={teamStats.totalEmployees}
                      icon={Users}
                      color="blue"
                      trend={{ direction: 'up', value: 12 }}
                    />
                    <StatsCard
                      title="On Leave Today"
                      value={teamStats.onLeaveToday}
                      icon={Calendar}
                      color="yellow"
                      subtitle="Out of office"
                    />
                    <StatsCard
                      title="Pending Approvals"
                      value={teamStats.pendingApprovals}
                      icon={Clock}
                      color="red"
                      trend={{ direction: 'down', value: 8 }}
                    />
                    <StatsCard
                      title="Approval Rate"
                      value={teamStats.approvalRate}
                      icon={CheckCircle}
                      color="green"
                      subtitle="This month"
                    />
                  </div>

                  {/* Quick Stats and Actions */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Pending Approvals Summary */}
                    <div className="card">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Pending Approvals</h3>
                        <button
                          onClick={() => window.location.href = '/manager/pending-approvals'}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          View All →
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {pendingLeaves.slice(0, 3).map((leave) => (
                          <div key={leave._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                                <Clock className="h-5 w-5 text-yellow-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{leave.userId?.name}</p>
                                <p className="text-sm text-gray-600 capitalize">{leave.leaveType} Leave</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">{leave.daysCount} days</p>
                              <span className="badge-warning">Pending</span>
                            </div>
                          </div>
                        ))}
                        
                        {pendingLeaves.length === 0 && (
                          <div className="text-center py-4">
                            <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                            <p className="text-gray-600">All caught up!</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Team Calendar Preview */}
                    <div className="card">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Upcoming Time Off</h3>
                        <button
                          onClick={() => window.location.href = '/manager/team-calendar'}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          View Calendar →
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {dashboardData?.leaves
                          ?.filter(leave => new Date(leave.startDate) >= new Date())
                          .slice(0, 3)
                          .map((leave, index) => (
                            <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                  <Calendar className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{leave.employee}</p>
                                  <p className="text-sm text-gray-600 capitalize">{leave.type} Leave</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">
                                  {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                                <span className="badge-success">Approved</span>
                              </div>
                            </div>
                          ))}
                        
                        {(!dashboardData?.leaves || dashboardData.leaves.length === 0) && (
                          <div className="text-center py-4">
                            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600">No upcoming leaves</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="card">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <button
                          onClick={() => window.location.href = '/manager/pending-approvals'}
                          className="w-full flex items-center justify-center btn-primary py-3"
                        >
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Review Approvals
                        </button>
                        <button
                          onClick={() => window.location.href = '/manager/team-calendar'}
                          className="w-full flex items-center justify-center btn-secondary py-3"
                        >
                          <Calendar className="h-5 w-5 mr-2" />
                          View Team Calendar
                        </button>
                        <button
                          onClick={() => window.location.href = '/manager/team-overview'}
                          className="w-full flex items-center justify-center btn-secondary py-3"
                        >
                          <TrendingUp className="h-5 w-5 mr-2" />
                          Team Analytics
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Team Performance */}
                  <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Team Performance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary-600 mb-2">24</div>
                        <p className="text-sm text-gray-600">Leaves Approved This Month</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">92%</div>
                        <p className="text-sm text-gray-600">Approval Rate</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">3.2</div>
                        <p className="text-sm text-gray-600">Avg Processing Time (Days)</p>
                      </div>
                    </div>
                  </div>
                </>
              } />
              
              <Route path="/pending-approvals" element={<PendingApprovals />} />
              <Route path="/team-calendar" element={<TeamCalendar />} />
              <Route path="/team-overview" element={<TeamOverview />} />
              
              <Route path="*" element={<Navigate to="/manager" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagerDashboard;