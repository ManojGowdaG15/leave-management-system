import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Calendar, CheckCircle, XCircle, Clock,
  TrendingUp, Download, Filter, ChevronDown,
  UserCheck, UserX
} from 'lucide-react';
import toast from 'react-hot-toast';
import leaveService from '../../services/leaveService';
import userService from '../../services/userService';
import './Manager.css';

const ManagerDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    pendingLeaves: [],
    teamStats: {},
    recentApprovals: [],
    teamMembers: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectComment, setRejectComment] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [leavesResponse, teamResponse] = await Promise.all([
        leaveService.getPendingLeaves(),
        userService.getTeamMembers()
      ]);

      const stats = calculateStats(leavesResponse);

      setDashboardData({
        pendingLeaves: leavesResponse,
        teamStats: stats,
        recentApprovals: leavesResponse.filter(l => l.status !== 'pending'),
        teamMembers: teamResponse.length
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (leaves) => {
    const total = leaves.length;
    const pending = leaves.filter(l => l.status === 'pending').length;
    const approved = leaves.filter(l => l.status === 'approved').length;
    const rejected = leaves.filter(l => l.status === 'rejected').length;

    return { total, pending, approved, rejected };
  };

  const handleApprove = async (leaveId) => {
    try {
      await leaveService.updateLeaveStatus(leaveId, 'approved');
      toast.success('Leave approved successfully');
      fetchDashboardData();
      setSelectedLeave(null);
    } catch (error) {
      toast.error('Failed to approve leave');
    }
  };

  const handleReject = async (leaveId) => {
    if (!rejectComment.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      await leaveService.updateLeaveStatus(leaveId, 'rejected', rejectComment);
      toast.success('Leave rejected successfully');
      fetchDashboardData();
      setSelectedLeave(null);
      setRejectComment('');
    } catch (error) {
      toast.error('Failed to reject leave');
    }
  };

  const handleQuickAction = async (leaveId, action) => {
    if (action === 'approve') {
      await handleApprove(leaveId);
    } else if (action === 'reject') {
      const comment = prompt('Enter reason for rejection:');
      if (comment) {
        try {
          await leaveService.updateLeaveStatus(leaveId, 'rejected', comment);
          toast.success('Leave rejected successfully');
          fetchDashboardData();
        } catch (error) {
          toast.error('Failed to reject leave');
        }
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 3600 * 24)) + 1;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="manager-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Manager Dashboard</h1>
          <p>Manage your team's leave requests</p>
        </div>
        <div className="header-actions">
          <button className="export-btn">
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon team">
            <Users size={24} />
          </div>
          <div>
            <h3>{dashboardData.teamMembers}</h3>
            <p>Team Members</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon pending">
            <Clock size={24} />
          </div>
          <div>
            <h3>{dashboardData.teamStats.pending}</h3>
            <p>Pending Approvals</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon approved">
            <CheckCircle size={24} />
          </div>
          <div>
            <h3>{dashboardData.teamStats.approved}</h3>
            <p>Approved This Month</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon rejected">
            <XCircle size={24} />
          </div>
          <div>
            <h3>{dashboardData.teamStats.rejected}</h3>
            <p>Rejected This Month</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Pending Approvals */}
        <div className="content-card">
          <div className="card-header">
            <h2>Pending Approvals ({dashboardData.teamStats.pending})</h2>
            <Link to="/manager/team-leaves" className="view-all">
              View All →
            </Link>
          </div>

          {dashboardData.pendingLeaves.length > 0 ? (
            <div className="approvals-list">
              {dashboardData.pendingLeaves.map((leave) => (
                <div key={leave._id} className="approval-item">
                  <div className="employee-info">
                    <div className="avatar">
                      {leave.userId?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4>{leave.userId?.name}</h4>
                      <p className="dept">{leave.userId?.department}</p>
                    </div>
                  </div>

                  <div className="leave-details">
                    <div className="type-badge">{leave.type}</div>
                    <div className="dates">
                      <Calendar size={14} />
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                      <span className="days">({calculateDays(leave.startDate, leave.endDate)} days)</span>
                    </div>
                    <p className="reason">{leave.reason}</p>
                  </div>

                  <div className="action-buttons">
                    <button
                      onClick={() => handleQuickAction(leave._id, 'approve')}
                      className="action-btn approve-btn"
                      title="Quick Approve"
                    >
                      <UserCheck size={16} />
                    </button>
                    <button
                      onClick={() => handleQuickAction(leave._id, 'reject')}
                      className="action-btn reject-btn"
                      title="Quick Reject"
                    >
                      <UserX size={16} />
                    </button>
                    <button
                      onClick={() => setSelectedLeave(leave._id)}
                      className="action-btn details-btn"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>

                  {selectedLeave === leave._id && (
                    <div className="approval-details">
                      <div className="details-content">
                        <textarea
                          placeholder="Add comment for rejection (optional for approval)..."
                          value={rejectComment}
                          onChange={(e) => setRejectComment(e.target.value)}
                          rows="3"
                        />
                        <div className="detail-actions">
                          <button
                            onClick={() => handleApprove(leave._id)}
                            className="btn-primary"
                          >
                            Approve Leave
                          </button>
                          <button
                            onClick={() => handleReject(leave._id)}
                            className="btn-danger"
                          >
                            Reject Leave
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <CheckCircle size={48} />
              <h3>No pending approvals</h3>
              <p>All leave requests have been processed</p>
            </div>
          )}
        </div>

        {/* Recent Activity & Quick Stats */}
        <div className="side-column">
          <div className="content-card">
            <h2>Quick Stats</h2>
            <div className="quick-stats">
              <div className="stat-item">
                <span>Approval Rate</span>
                <span className="stat-value">
                  {dashboardData.teamStats.total > 0 
                    ? Math.round((dashboardData.teamStats.approved / dashboardData.teamStats.total) * 100)
                    : 0}%
                </span>
              </div>
              <div className="stat-item">
                <span>Avg Processing Time</span>
                <span className="stat-value">2.3 days</span>
              </div>
              <div className="stat-item">
                <span>Most Common Type</span>
                <span className="stat-value">Casual</span>
              </div>
            </div>
          </div>

          <div className="content-card">
            <h2>Quick Actions</h2>
            <div className="quick-actions">
              <Link to="/manager/team-leaves" className="action-btn">
                <Users size={20} />
                Team Leaves
              </Link>
              <Link to="/manager/team-management" className="action-btn">
                <UserCog size={20} />
                Manage Team
              </Link>
              <Link to="/apply-leave" className="action-btn">
                <Calendar size={20} />
                Apply Leave
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;