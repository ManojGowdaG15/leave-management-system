import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, PieChart, TrendingUp, TrendingDown, 
  RefreshCw, Download, Calendar, AlertCircle,
  TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon
} from 'lucide-react';
import './LeaveBalance.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const LeaveBalance = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchLeaveBalance();
    fetchLeaveHistory();
  }, []);

  const fetchLeaveBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/leave-balance`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch leave balance');
      
      const data = await response.json();
      setBalance(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/leaves`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data.filter(leave => leave.status === 'approved'));
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchLeaveBalance();
    fetchLeaveHistory();
  };

  const calculateUsage = (used, total) => {
    if (total === 0) return 0;
    return Math.round((used / total) * 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage < 50) return '#10b981';
    if (percentage < 80) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading leave balance...</p>
      </div>
    );
  }

  const leaveTypes = [
    {
      name: 'Casual Leaves',
      available: (balance?.casualLeaves || 12) - (balance?.usedCasual || 0),
      used: balance?.usedCasual || 0,
      total: balance?.casualLeaves || 12,
      icon: '🎯',
      color: '#3b82f6'
    },
    {
      name: 'Sick Leaves',
      available: (balance?.sickLeaves || 10) - (balance?.usedSick || 0),
      used: balance?.usedSick || 0,
      total: balance?.sickLeaves || 10,
      icon: '🏥',
      color: '#f59e0b'
    },
    {
      name: 'Earned Leaves',
      available: (balance?.earnedLeaves || 15) - (balance?.usedEarned || 0),
      used: balance?.usedEarned || 0,
      total: balance?.earnedLeaves || 15,
      icon: '⭐',
      color: '#10b981'
    }
  ];

  const totalAvailable = leaveTypes.reduce((sum, type) => sum + type.available, 0);
  const totalUsed = leaveTypes.reduce((sum, type) => sum + type.used, 0);
  const totalLeaves = leaveTypes.reduce((sum, type) => sum + type.total, 0);
  const totalUsage = calculateUsage(totalUsed, totalLeaves);

  return (
    <div className="leave-balance-container">
      <div className="leave-balance-card">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <button onClick={() => navigate('/dashboard')} className="back-button">
              <ArrowLeft size={20} />
              Back to Dashboard
            </button>
            <h1>Leave Balance</h1>
            <p>Track your available leaves and usage</p>
          </div>
          <div className="header-actions">
            <button onClick={handleRefresh} className="refresh-button">
              <RefreshCw size={18} />
              Refresh
            </button>
            <button className="export-button">
              <Download size={18} />
              Export Report
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card total">
            <div className="card-icon">
              <PieChart size={24} />
            </div>
            <div className="card-content">
              <span className="card-label">Total Leaves Available</span>
              <span className="card-value">{totalAvailable}</span>
              <span className="card-subtext">Out of {totalLeaves} total leaves</span>
            </div>
          </div>
          
          <div className="summary-card used">
            <div className="card-icon">
              <TrendingUp size={24} />
            </div>
            <div className="card-content">
              <span className="card-label">Leaves Used</span>
              <span className="card-value">{totalUsed}</span>
              <span className="card-subtext">{totalUsage}% of total leaves</span>
            </div>
          </div>
          
          <div className="summary-card remaining">
            <div className="card-icon">
              <TrendingDown size={24} />
            </div>
            <div className="card-content">
              <span className="card-label">Balance Remaining</span>
              <span className="card-value">{totalAvailable}</span>
              <span className="card-subtext">{100 - totalUsage}% available</span>
            </div>
          </div>
        </div>

        {/* Leave Type Breakdown */}
        <div className="breakdown-section">
          <h2>Leave Type Breakdown</h2>
          <div className="breakdown-cards">
            {leaveTypes.map((type, index) => {
              const usagePercentage = calculateUsage(type.used, type.total);
              const usageColor = getUsageColor(usagePercentage);
              
              return (
                <div key={index} className="breakdown-card">
                  <div className="breakdown-header">
                    <div className="type-info">
                      <div className="type-icon" style={{ backgroundColor: `${type.color}20` }}>
                        <span style={{ color: type.color, fontSize: '24px' }}>
                          {type.icon}
                        </span>
                      </div>
                      <div>
                        <h3>{type.name}</h3>
                        <div className="usage-percentage">
                          <span style={{ color: usageColor, fontWeight: 600 }}>
                            {usagePercentage}% used
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="breakdown-content">
                    <div className="balance-info">
                      <div className="balance-item">
                        <span className="label">Available</span>
                        <span className="value" style={{ color: type.color }}>
                          {type.available} days
                        </span>
                      </div>
                      <div className="balance-item">
                        <span className="label">Used</span>
                        <span className="value">{type.used} days</span>
                      </div>
                      <div className="balance-item">
                        <span className="label">Total</span>
                        <span className="value">{type.total} days</span>
                      </div>
                    </div>
                    
                    <div className="progress-container">
                      <div className="progress-bar">
                        <div 
                          className="progress" 
                          style={{ 
                            width: `${usagePercentage}%`,
                            backgroundColor: type.color
                          }}
                        ></div>
                      </div>
                      <div className="progress-labels">
                        <span>0</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Usage History */}
        <div className="history-section">
          <div className="section-header">
            <h2>Recent Usage History</h2>
            <button 
              onClick={() => navigate('/leave-history')}
              className="view-all-button"
            >
              View Full History →
            </button>
          </div>
          
          {history.length > 0 ? (
            <div className="history-table">
              <div className="table-header">
                <div className="header-cell">Type</div>
                <div className="header-cell">Dates</div>
                <div className="header-cell">Duration</div>
                <div className="header-cell">Applied Date</div>
              </div>
              
              <div className="table-body">
                {history.slice(0, 5).map((leave, index) => (
                  <div key={index} className="table-row">
                    <div className="table-cell">
                      <div className={`type-badge ${leave.type}`}>
                        {leave.type.charAt(0).toUpperCase() + leave.type.slice(1)}
                      </div>
                    </div>
                    
                    <div className="table-cell">
                      <div className="dates">
                        <Calendar size={14} />
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="table-cell">
                      <div className="duration">
                        {Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 3600 * 24)) + 1} days
                      </div>
                    </div>
                    
                    <div className="table-cell">
                      {new Date(leave.appliedDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-history">
              <AlertCircle size={48} />
              <h3>No usage history found</h3>
              <p>You haven't taken any approved leaves yet.</p>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="tips-section">
          <h3>Leave Management Tips</h3>
          <div className="tips-grid">
            <div className="tip-card">
              <div className="tip-icon">
                <TrendingUpIcon size={24} />
              </div>
              <h4>Plan Wisely</h4>
              <p>Schedule your leaves in advance to ensure availability and better approval chances.</p>
            </div>
            
            <div className="tip-card">
              <div className="tip-icon">
                <TrendingDownIcon size={24} />
              </div>
              <h4>Monitor Usage</h4>
              <p>Regularly check your leave balance to avoid last-minute surprises.</p>
            </div>
            
            <div className="tip-card">
              <div className="tip-icon">
                <RefreshCw size={24} />
              </div>
              <h4>Carry Forward</h4>
              <p>Earned leaves can be carried forward (max 30 days) or encashed at year-end.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveBalance;