import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Plus,
  TrendingUp,
  FileText,
  Calendar as CalendarIcon
} from 'lucide-react';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDashboardData(data);
      setError('');
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = () => {
    navigate('/apply-leave');
  };

  const handleViewLeaveHistory = () => {
    navigate('/leaves');
  };

  const handleCheckBalance = () => {
    navigate('/leave-balance');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <AlertCircle size={48} />
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="retry-button"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="dashboard-error">
        <AlertCircle size={48} />
        <h3>No Data Available</h3>
        <p>Unable to load dashboard data. Please try again.</p>
        <button 
          onClick={fetchDashboardData}
          className="retry-button"
        >
          Retry
        </button>
      </div>
    );
  }

  const { user, leaveBalance, leaveCounts, recentLeaves } = dashboardData;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Leave Management System</h1>
          <h2>Welcome back, {user?.name || 'User'}!</h2>
          <p className="welcome-message">Track your leaves and apply for time off</p>
        </div>
      </div>

      {/* Leave Cards */}
      <div className="leave-cards-grid">
        <div className="leave-card casual">
          <div className="leave-card-header">
            <Calendar className="leave-icon" />
            <h3>Casual Leaves</h3>
          </div>
          <div className="leave-card-content">
            <div className="leave-count">
              {leaveBalance ? leaveBalance.casualLeaves - leaveBalance.usedCasual : 12}
              <span>days</span>
            </div>
            <div className="leave-total">Total: {leaveBalance?.casualLeaves || 12} days</div>
          </div>
        </div>

        <div className="leave-card sick">
          <div className="leave-card-header">
            <AlertCircle className="leave-icon" />
            <h3>Sick Leaves</h3>
          </div>
          <div className="leave-card-content">
            <div className="leave-count">
              {leaveBalance ? leaveBalance.sickLeaves - leaveBalance.usedSick : 10}
              <span>days</span>
            </div>
            <div className="leave-total">Total: {leaveBalance?.sickLeaves || 10} days</div>
          </div>
        </div>

        <div className="leave-card earned">
          <div className="leave-card-header">
            <TrendingUp className="leave-icon" />
            <h3>Earned Leaves</h3>
          </div>
          <div className="leave-card-content">
            <div className="leave-count">
              {leaveBalance ? leaveBalance.earnedLeaves - leaveBalance.usedEarned : 15}
              <span>days</span>
            </div>
            <div className="leave-total">Total: {leaveBalance?.earnedLeaves || 15} days</div>
          </div>
        </div>

        <div className="status-cards">
          <div className="status-card pending">
            <Clock className="status-icon" />
            <div>
              <div className="status-count">{leaveCounts?.pending || 0}</div>
              <div className="status-label">Pending</div>
            </div>
          </div>
          <div className="status-card approved">
            <CheckCircle className="status-icon" />
            <div>
              <div className="status-count">{leaveCounts?.approved || 0}</div>
              <div className="status-label">Approved</div>
            </div>
          </div>
          <div className="status-card rejected">
            <XCircle className="status-icon" />
            <div>
              <div className="status-count">{leaveCounts?.rejected || 0}</div>
              <div className="status-label">Rejected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Left Column - Recent Leaves */}
        <div className="recent-leaves">
          <div className="section-header">
            <h3>Recent Leave Applications</h3>
            <button 
              onClick={handleViewLeaveHistory}
              className="view-all-button"
            >
              View all leaves →
            </button>
          </div>
          
          {recentLeaves && recentLeaves.length > 0 ? (
            <div className="leaves-list">
              {recentLeaves.map((leave) => (
                <div key={leave.id || leave._id} className="leave-item">
                  <div className="leave-type-badge">
                    {leave.type?.charAt(0).toUpperCase() + leave.type?.slice(1)}
                  </div>
                  <div className="leave-details">
                    <div className="leave-dates">
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </div>
                    <div className="leave-reason">{leave.reason}</div>
                  </div>
                  <div className={`leave-status ${leave.status}`}>
                    {leave.status?.charAt(0).toUpperCase() + leave.status?.slice(1)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-leaves">
              <FileText size={48} />
              <p>No recent leaves found</p>
              <button 
                onClick={handleApplyLeave}
                className="apply-first-button"
              >
                <Plus size={20} />
                Apply for your first leave
              </button>
            </div>
          )}
        </div>

        {/* Right Column - Quick Actions & Tips */}
        <div className="right-column">
          {/* Quick Actions */}
          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="actions-grid">
              <button 
                onClick={handleApplyLeave}
                className="action-button primary"
              >
                <Plus size={24} />
                <span>Apply for Leave</span>
                <small>Submit a new leave request</small>
              </button>
              
              <button 
                onClick={handleCheckBalance}
                className="action-button secondary"
              >
                <CalendarIcon size={24} />
                <span>Check Leave Balance</span>
                <small>View available leaves</small>
              </button>
              
              <button 
                onClick={handleViewLeaveHistory}
                className="action-button tertiary"
              >
                <FileText size={24} />
                <span>View Leave History</span>
                <small>Check past applications</small>
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="leave-tips">
            <h3>Leave Management Tips</h3>
            <div className="tip">
              <div className="tip-icon">📅</div>
              <div>
                <h4>Plan Ahead</h4>
                <p>Apply for leaves at least 2 days in advance for better approval chances.</p>
              </div>
            </div>
            <div className="tip">
              <div className="tip-icon">💰</div>
              <div>
                <h4>Check Balance</h4>
                <p>Regularly monitor your leave balance to avoid surprises.</p>
              </div>
            </div>
            <div className="tip">
              <div className="tip-icon">📋</div>
              <div>
                <h4>Documentation</h4>
                <p>Keep necessary documents ready for sick leaves beyond 2 days.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>© 2025 Leave Management System</p>
        <p className="consulting-name">DuisSturdy Consulting - Assignment</p>
      </footer>
    </div>
  );
};

export default Dashboard;