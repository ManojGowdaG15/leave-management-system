import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, AlertCircle, CheckCircle, 
  XCircle, Plus, TrendingUp, FileText, LogOut, User
} from 'lucide-react';
import './Employee.css';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    availableLeaves: 24,
    pending: 3,
    approved: 12
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(userData);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="employee-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Leave Management System</h1>
          <h2>Welcome back, {user.name}!</h2>
          <p>Track your leaves and apply for time off</p>
        </div>
        
        <div className="header-right">
          <div className="user-info">
            <User size={20} />
            <div className="user-details">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role} • {user.department}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-button">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Calendar />
          </div>
          <div className="stat-content">
            <span className="stat-label">Available Leaves</span>
            <span className="stat-value">{stats.availableLeaves}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <Clock />
          </div>
          <div className="stat-content">
            <span className="stat-label">Pending Approvals</span>
            <span className="stat-value">{stats.pending}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <CheckCircle />
          </div>
          <div className="stat-content">
            <span className="stat-label">Approved Leaves</span>
            <span className="stat-value">{stats.approved}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="left-column">
          {/* Leave Balance Cards */}
          <div className="leave-balance-section">
            <h3>Leave Balance</h3>
            <div className="leave-cards">
              <div className="leave-card casual">
                <div className="card-header">
                  <Calendar className="card-icon" />
                  <h4>Casual Leaves</h4>
                </div>
                <div className="card-content">
                  <div className="balance">
                    <span className="available">8</span>
                    <span className="total">/ 12</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress" style={{ width: '33%' }}></div>
                  </div>
                  <div className="used">Used: 4 days</div>
                </div>
              </div>

              <div className="leave-card sick">
                <div className="card-header">
                  <AlertCircle className="card-icon" />
                  <h4>Sick Leaves</h4>
                </div>
                <div className="card-content">
                  <div className="balance">
                    <span className="available">9</span>
                    <span className="total">/ 10</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress" style={{ width: '10%' }}></div>
                  </div>
                  <div className="used">Used: 1 day</div>
                </div>
              </div>

              <div className="leave-card earned">
                <div className="card-header">
                  <TrendingUp className="card-icon" />
                  <h4>Earned Leaves</h4>
                </div>
                <div className="card-content">
                  <div className="balance">
                    <span className="available">12</span>
                    <span className="total">/ 15</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress" style={{ width: '20%' }}></div>
                  </div>
                  <div className="used">Used: 3 days</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Leaves */}
          <div className="recent-leaves-section">
            <div className="section-header">
              <h3>Recent Applications</h3>
              <button 
                onClick={() => navigate('/leave-history')}
                className="view-all-button"
              >
                View All →
              </button>
            </div>
            
            <div className="leaves-list">
              <div className="leave-item">
                <div className="leave-info">
                  <div className="leave-type-badge">Casual</div>
                  <div className="leave-details">
                    <div className="leave-dates">Dec 15 - Dec 17, 2024</div>
                    <div className="leave-reason">Family function</div>
                  </div>
                </div>
                <div className="leave-status approved">Approved</div>
              </div>
              
              <div className="leave-item">
                <div className="leave-info">
                  <div className="leave-type-badge">Sick</div>
                  <div className="leave-details">
                    <div className="leave-dates">Dec 20 - Dec 21, 2024</div>
                    <div className="leave-reason">Medical checkup</div>
                  </div>
                </div>
                <div className="leave-status pending">Pending</div>
              </div>
              
              <div className="leave-item">
                <div className="leave-info">
                  <div className="leave-type-badge">Earned</div>
                  <div className="leave-details">
                    <div className="leave-dates">Jan 5 - Jan 10, 2025</div>
                    <div className="leave-reason">Vacation</div>
                  </div>
                </div>
                <div className="leave-status pending">Pending</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          {/* Quick Actions */}
          <div className="quick-actions-section">
            <h3>Quick Actions</h3>
            <div className="actions-grid">
              <button 
                onClick={() => navigate('/apply-leave')}
                className="action-button primary"
              >
                <Plus size={24} />
                <span>Apply for Leave</span>
                <small>Submit new leave request</small>
              </button>
              
              <button 
                onClick={() => navigate('/leave-balance')}
                className="action-button secondary"
              >
                <TrendingUp size={24} />
                <span>Check Balance</span>
                <small>View detailed leave balance</small>
              </button>
              
              <button 
                onClick={() => navigate('/leave-history')}
                className="action-button tertiary"
              >
                <FileText size={24} />
                <span>View History</span>
                <small>Check all applications</small>
              </button>
            </div>
          </div>

          {/* Leave Status Summary */}
          <div className="status-summary">
            <h3>Leave Status</h3>
            <div className="status-cards">
              <div className="status-card pending">
                <Clock className="status-icon" />
                <div className="status-info">
                  <div className="status-count">{stats.pending}</div>
                  <div className="status-label">Pending</div>
                </div>
              </div>
              <div className="status-card approved">
                <CheckCircle className="status-icon" />
                <div className="status-info">
                  <div className="status-count">{stats.approved}</div>
                  <div className="status-label">Approved</div>
                </div>
              </div>
              <div className="status-card rejected">
                <XCircle className="status-icon" />
                <div className="status-info">
                  <div className="status-count">1</div>
                  <div className="status-label">Rejected</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="tips-section">
            <h3>Leave Management Tips</h3>
            <div className="tips-list">
              <div className="tip">
                <div className="tip-icon">📅</div>
                <div className="tip-content">
                  <h4>Plan Ahead</h4>
                  <p>Apply for leaves at least 2 days in advance for better approval chances.</p>
                </div>
              </div>
              <div className="tip">
                <div className="tip-icon">💰</div>
                <div className="tip-content">
                  <h4>Check Balance</h4>
                  <p>Regularly monitor your leave balance to avoid surprises.</p>
                </div>
              </div>
              <div className="tip">
                <div className="tip-icon">📋</div>
                <div className="tip-content">
                  <h4>Documentation</h4>
                  <p>Keep necessary documents ready for sick leaves beyond 2 days.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;