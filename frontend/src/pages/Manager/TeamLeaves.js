import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Users, Filter, Search,
  ChevronLeft, ChevronRight, Download, MoreVertical,
  CheckCircle, XCircle, Clock, User
} from 'lucide-react';
import './TeamLeaves.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const TeamLeaves = () => {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTeamLeaves();
  }, []);

  const fetchTeamLeaves = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/manager/leaves`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch team leaves');
      
      const data = await response.json();
      setLeaves(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (leaveId, status, comment = '') => {
    if (status === 'rejected' && !comment) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/leaves/${leaveId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, comment }),
      });

      if (!response.ok) throw new Error('Failed to update leave status');
      
      // Refresh leaves
      fetchTeamLeaves();
      alert(`Leave ${status} successfully`);
    } catch (error) {
      alert('Failed to update leave status');
    }
  };

  // Filter and search
  const filteredLeaves = leaves.filter(leave => {
    const matchesFilter = filter === 'all' || leave.status === filter;
    const matchesSearch = 
      leave.employeeName?.toLowerCase().includes(search.toLowerCase()) ||
      leave.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      leave.reason?.toLowerCase().includes(search.toLowerCase()) ||
      leave.type?.toLowerCase().includes(search.toLowerCase());
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
      default: return <User size={16} />;
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

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading team leaves...</p>
      </div>
    );
  }

  return (
    <div className="team-leaves-container">
      <div className="team-leaves-card">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <button onClick={() => navigate('/manager-dashboard')} className="back-button">
              <ArrowLeft size={20} />
              Back to Dashboard
            </button>
            <h1>Team Leaves</h1>
            <p>Manage and track your team's leave applications</p>
          </div>
          <button className="export-button">
            <Download size={18} />
            Export Report
          </button>
        </div>

        {/* Stats */}
        <div className="team-stats">
          <div className="stat-card">
            <Users size={24} />
            <div>
              <div className="stat-label">Team Members</div>
              <div className="stat-value">
                {[...new Set(leaves.map(leave => leave.userId?._id))].length}
              </div>
            </div>
          </div>
          <div className="stat-card">
            <Calendar size={24} />
            <div>
              <div className="stat-label">Total Leaves</div>
              <div className="stat-value">{leaves.length}</div>
            </div>
          </div>
          <div className="stat-card">
            <CheckCircle size={24} />
            <div>
              <div className="stat-label">Approved</div>
              <div className="stat-value">{leaves.filter(l => l.status === 'approved').length}</div>
            </div>
          </div>
          <div className="stat-card">
            <Clock size={24} />
            <div>
              <div className="stat-label">Pending</div>
              <div className="stat-value">{leaves.filter(l => l.status === 'pending').length}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by employee name, reason, or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="filter-tabs">
            {['all', 'pending', 'approved', 'rejected', 'cancelled'].map((status) => (
              <button
                key={status}
                className={`filter-tab ${filter === status ? 'active' : ''}`}
                onClick={() => {
                  setFilter(status);
                  setCurrentPage(1);
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== 'all' && (
                  <span className="tab-count">
                    {leaves.filter(l => l.status === status).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Leaves Table */}
        <div className="leaves-table-container">
          {paginatedLeaves.length > 0 ? (
            <>
              <div className="leaves-table">
                <div className="table-header">
                  <div className="header-cell">Employee</div>
                  <div className="header-cell">Leave Type</div>
                  <div className="header-cell">Dates</div>
                  <div className="header-cell">Duration</div>
                  <div className="header-cell">Reason</div>
                  <div className="header-cell">Status</div>
                  <div className="header-cell">Actions</div>
                </div>
                
                <div className="table-body">
                  {paginatedLeaves.map((leave) => (
                    <div key={leave._id} className="table-row">
                      <div className="table-cell">
                        <div className="employee-info">
                          <div className="avatar">
                            {leave.userId?.name?.charAt(0) || leave.employeeName?.charAt(0) || 'E'}
                          </div>
                          <div>
                            <div className="employee-name">
                              {leave.userId?.name || leave.employeeName || 'Employee'}
                            </div>
                            <div className="employee-dept">
                              {leave.userId?.department || 'Department'}
                            </div>
                          </div>
                        </div>
                      </div>
                      
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
                        {leave.managerComment && (
                          <div className="manager-comment">
                            <strong>Comment:</strong> {leave.managerComment}
                          </div>
                        )}
                      </div>
                      
                      <div className="table-cell">
                        <div 
                          className="status-badge"
                          style={{ 
                            backgroundColor: `${getStatusColor(leave.status)}20`,
                            color: getStatusColor(leave.status),
                            borderColor: getStatusColor(leave.status)
                          }}
                        >
                          {getStatusIcon(leave.status)}
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </div>
                      </div>
                      
                      <div className="table-cell">
                        <div className="action-buttons">
                          {leave.status === 'pending' && (
                            <>
                              <button
                                onClick={() => {
                                  const comment = prompt('Add comment (optional):');
                                  handleApproveReject(leave._id, 'approved', comment);
                                }}
                                className="action-button approve"
                                title="Approve"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  const comment = prompt('Reason for rejection:');
                                  if (comment) handleApproveReject(leave._id, 'rejected', comment);
                                }}
                                className="action-button reject"
                                title="Reject"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          <button className="action-button view">
                            <MoreVertical size={16} />
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
                  
                  <div className="page-info">
                    Page {currentPage} of {totalPages}
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
              <Users size={48} />
              <h3>No leave applications found</h3>
              <p>There are no {filter !== 'all' ? filter : ''} leave applications in your team.</p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="summary-section">
          <h3>Team Leave Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <h4>Most Common Leave Type</h4>
              <p>
                {leaves.length > 0 
                  ? Object.entries(
                      leaves.reduce((acc, leave) => {
                        acc[leave.type] = (acc[leave.type] || 0) + 1;
                        return acc;
                      }, {})
                    ).sort((a, b) => b[1] - a[1])[0][0]
                  : 'N/A'
                }
              </p>
            </div>
            
            <div className="summary-item">
              <h4>Average Leave Duration</h4>
              <p>
                {leaves.length > 0 
                  ? Math.round(
                      leaves.reduce((total, leave) => 
                        total + calculateDays(leave.startDate, leave.endDate), 0
                      ) / leaves.length
                    ) 
                  : 0
                } days
              </p>
            </div>
            
            <div className="summary-item">
              <h4>Approval Rate</h4>
              <p>
                {leaves.filter(l => l.status === 'approved' || l.status === 'rejected').length > 0
                  ? Math.round(
                      (leaves.filter(l => l.status === 'approved').length / 
                      leaves.filter(l => l.status === 'approved' || l.status === 'rejected').length) * 100
                    )
                  : 0
                }%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamLeaves;