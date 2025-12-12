import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Filter, Download, 
  CheckCircle, XCircle, Clock, FileText,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import './LeaveHistory.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const LeaveHistory = () => {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/leaves`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch leaves');
      
      const data = await response.json();
      setLeaves(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm('Are you sure you want to cancel this leave?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/leaves/${leaveId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to cancel leave');
      
      // Refresh leaves
      fetchLeaves();
      alert('Leave cancelled successfully');
    } catch (error) {
      alert('Failed to cancel leave');
    }
  };

  // Filter and search
  const filteredLeaves = leaves.filter(leave => {
    const matchesFilter = filter === 'all' || leave.status === filter;
    const matchesSearch = 
      leave.reason.toLowerCase().includes(search.toLowerCase()) ||
      leave.type.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeaves = filteredLeaves.slice(startIndex, startIndex + itemsPerPage);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'pending': return '#f59e0b';
      case 'cancelled': return '#94a3b8';
      default: return '#64748b';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading leave history...</p>
      </div>
    );
  }

  return (
    <div className="leave-history-container">
      <div className="leave-history-card">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <button onClick={() => navigate('/dashboard')} className="back-button">
              <ArrowLeft size={20} />
              Back to Dashboard
            </button>
            <h1>Leave History</h1>
            <p>View and manage all your leave applications</p>
          </div>
          <button className="export-button">
            <Download size={18} />
            Export
          </button>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by reason or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="filter-buttons">
            {['all', 'pending', 'approved', 'rejected', 'cancelled'].map((status) => (
              <button
                key={status}
                className={`filter-button ${filter === status ? 'active' : ''}`}
                onClick={() => setFilter(status)}
              >
                <Filter size={14} />
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-label">Total Leaves</div>
            <div className="stat-value">{leaves.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Pending</div>
            <div className="stat-value">{leaves.filter(l => l.status === 'pending').length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Approved</div>
            <div className="stat-value">{leaves.filter(l => l.status === 'approved').length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Rejected</div>
            <div className="stat-value">{leaves.filter(l => l.status === 'rejected').length}</div>
          </div>
        </div>

        {/* Table */}
        <div className="leaves-table-container">
          {paginatedLeaves.length > 0 ? (
            <>
              <div className="leaves-table">
                <div className="table-header">
                  <div className="header-cell">Leave Type</div>
                  <div className="header-cell">Dates</div>
                  <div className="header-cell">Duration</div>
                  <div className="header-cell">Reason</div>
                  <div className="header-cell">Status</div>
                  <div className="header-cell">Applied Date</div>
                  <div className="header-cell">Actions</div>
                </div>
                
                <div className="table-body">
                  {paginatedLeaves.map((leave) => (
                    <div key={leave._id} className="table-row">
                      <div className="table-cell">
                        <div className={`type-badge ${leave.type}`}>
                          {leave.type.charAt(0).toUpperCase() + leave.type.slice(1)}
                        </div>
                      </div>
                      
                      <div className="table-cell">
                        <div className="dates">
                          <Calendar size={14} />
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                        </div>
                      </div>
                      
                      <div className="table-cell">
                        <div className="duration">
                          {calculateDays(leave.startDate, leave.endDate)} days
                        </div>
                      </div>
                      
                      <div className="table-cell reason-cell">
                        {leave.reason}
                      </div>
                      
                      <div className="table-cell">
                        <div 
                          className="status-badge"
                          style={{ color: getStatusColor(leave.status) }}
                        >
                          {getStatusIcon(leave.status)}
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </div>
                      </div>
                      
                      <div className="table-cell">
                        {formatDate(leave.appliedDate)}
                      </div>
                      
                      <div className="table-cell">
                        <div className="action-buttons">
                          {leave.status === 'pending' && (
                            <button
                              onClick={() => handleCancelLeave(leave._id)}
                              className="action-button cancel"
                            >
                              Cancel
                            </button>
                          )}
                          <button className="action-button view">
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="pagination-button"
                  >
                    <ChevronLeft size={18} />
                    Previous
                  </button>
                  
                  <div className="page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`page-number ${currentPage === page ? 'active' : ''}`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="pagination-button"
                  >
                    Next
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-data">
              <FileText size={48} />
              <h3>No leave applications found</h3>
              <p>You haven't applied for any leaves yet.</p>
              <button 
                onClick={() => navigate('/apply-leave')}
                className="apply-button"
              >
                Apply for Leave
              </button>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="summary-section">
          <h3>Summary</h3>
          <div className="summary-content">
            <div className="summary-item">
              <span>Total Leave Days Used:</span>
              <span className="summary-value">
                {leaves
                  .filter(l => l.status === 'approved')
                  .reduce((total, leave) => {
                    return total + calculateDays(leave.startDate, leave.endDate);
                  }, 0)} days
              </span>
            </div>
            <div className="summary-item">
              <span>Average Leave Duration:</span>
              <span className="summary-value">
                {leaves.length > 0 
                  ? Math.round(leaves.reduce((total, leave) => {
                      return total + calculateDays(leave.startDate, leave.endDate);
                    }, 0) / leaves.length)
                  : 0} days
              </span>
            </div>
            <div className="summary-item">
              <span>Approval Rate:</span>
              <span className="summary-value">
                {leaves.length > 0 
                  ? Math.round((leaves.filter(l => l.status === 'approved').length / leaves.length) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveHistory;