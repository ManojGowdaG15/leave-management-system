import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User, Calendar, Filter, Search } from 'lucide-react';
import Loader from '../common/Loader';
import Modal from '../common/Modal';
import { managerAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';

const PendingApprovals = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [comments, setComments] = useState('');

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  const fetchPendingLeaves = async () => {
    try {
      const response = await managerAPI.getPendingLeaves();
      setLeaves(response.data.data);
    } catch (error) {
      toast.error('Failed to load pending leaves');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, comments = '') => {
    setActionLoading(true);
    try {
      await managerAPI.approveLeave(id, comments);
      setLeaves(prev => prev.filter(leave => leave._id !== id));
      toast.success('Leave approved successfully');
      setModalOpen(false);
    } catch (error) {
      toast.error(error.message || 'Failed to approve leave');
    } finally {
      setActionLoading(false);
      setComments('');
    }
  };

  const handleReject = async (id, comments = '') => {
    setActionLoading(true);
    try {
      await managerAPI.rejectLeave(id, comments);
      setLeaves(prev => prev.filter(leave => leave._id !== id));
      toast.success('Leave rejected successfully');
      setModalOpen(false);
    } catch (error) {
      toast.error(error.message || 'Failed to reject leave');
    } finally {
      setActionLoading(false);
      setComments('');
    }
  };

  const handleViewDetails = (leave) => {
    setSelectedLeave(leave);
    setModalOpen(true);
  };

  const handleBulkAction = (action) => {
    // For demo purposes - in real app, you'd have bulk action logic
    if (action === 'approve') {
      toast.success('Bulk approval feature coming soon!');
    } else {
      toast.error('Bulk rejection feature coming soon!');
    }
  };

  const filteredLeaves = leaves.filter(leave => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        leave.userId?.name.toLowerCase().includes(term) ||
        leave.reason.toLowerCase().includes(term) ||
        leave.leaveType.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const getStats = () => {
    const total = leaves.length;
    const casual = leaves.filter(l => l.leaveType === 'casual').length;
    const sick = leaves.filter(l => l.leaveType === 'sick').length;
    const earned = leaves.filter(l => l.leaveType === 'earned').length;
    
    return { total, casual, sick, earned };
  };

  const stats = getStats();

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
          <p className="text-gray-600">Review and manage team leave requests</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {filteredLeaves.length > 0 && (
            <>
              <button
                onClick={() => handleBulkAction('approve')}
                className="flex items-center btn-success"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Bulk Approve
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                className="flex items-center btn-danger"
              >
                <XCircle className="h-5 w-5 mr-2" />
                Bulk Reject
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-sm text-gray-600">Total Pending</p>
          <p className="text-2xl font-bold text-warning-600 mt-1">{stats.total}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-600">Casual Leaves</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.casual}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-600">Sick Leaves</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.sick}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-600">Earned Leaves</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.earned}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by employee name or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input py-2"
              >
                <option value="all">All Types</option>
                <option value="casual">Casual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="earned">Earned Leave</option>
              </select>
            </div>
            
            <button
              onClick={fetchPendingLeaves}
              className="btn-secondary"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Leave List */}
      <div className="space-y-4">
        {filteredLeaves.length === 0 ? (
          <div className="card text-center py-12">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'No pending leaves match your search criteria'
                : 'No pending leave requests at the moment'
              }
            </p>
          </div>
        ) : (
          filteredLeaves.map((leave) => (
            <div key={leave._id} className="card-hover">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{leave.userId?.name}</p>
                          <p className="text-xs text-gray-500">{leave.userId?.department}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        leave.leaveType === 'casual' ? 'bg-blue-100 text-blue-800' :
                        leave.leaveType === 'sick' ? 'bg-red-100 text-red-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {leave.leaveType} Leave
                      </span>
                    </div>
                    <span className="badge-warning">Pending</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</span>
                      <span className="mx-2">•</span>
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{leave.daysCount} days</span>
                    </div>
                    
                    <p className="text-sm text-gray-700 line-clamp-2">
                      <span className="font-medium">Reason:</span> {leave.reason}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleApprove(leave._id)}
                    disabled={actionLoading}
                    className="flex items-center justify-center btn-success px-4 py-2"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(leave._id)}
                    disabled={actionLoading}
                    className="flex items-center justify-center btn-danger px-4 py-2"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleViewDetails(leave)}
                    className="flex items-center justify-center btn-secondary px-4 py-2"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Leave Details Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setComments('');
        }}
        title="Review Leave Application"
        size="lg"
      >
        {selectedLeave && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Employee</p>
                <div className="flex items-center mt-1">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="font-medium text-gray-900">{selectedLeave.userId?.name}</p>
                    <p className="text-sm text-gray-600">{selectedLeave.userId?.department}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Leave Type</p>
                <div className="flex items-center mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                    selectedLeave.leaveType === 'casual' ? 'bg-blue-100 text-blue-800' :
                    selectedLeave.leaveType === 'sick' ? 'bg-red-100 text-red-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {selectedLeave.leaveType} Leave
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Dates</p>
                <p className="font-medium text-gray-900 mt-1">
                  {formatDate(selectedLeave.startDate)} - {formatDate(selectedLeave.endDate)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-medium text-gray-900 mt-1">
                  {selectedLeave.daysCount} days
                </p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-2">Reason</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900">{selectedLeave.reason}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Comments (Optional)
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="input min-h-[100px]"
                placeholder="Add comments for the employee..."
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                Comments will be visible to the employee
              </p>
            </div>
            
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setModalOpen(false);
                  setComments('');
                }}
                className="btn-secondary"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedLeave._id, comments)}
                disabled={actionLoading}
                className="flex items-center btn-danger"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Leave
                  </>
                )}
              </button>
              <button
                onClick={() => handleApprove(selectedLeave._id, comments)}
                disabled={actionLoading}
                className="flex items-center btn-success"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Leave
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PendingApprovals;