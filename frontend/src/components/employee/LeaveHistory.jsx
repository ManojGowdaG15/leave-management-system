import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Search, Download, XCircle } from 'lucide-react';
import LeaveCard from '../common/LeaveCard';
import Loader from '../common/Loader';
import Modal from '../common/Modal';
import { leaveAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';

const LeaveHistory = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelingId, setCancelingId] = useState(null);

  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  const fetchLeaveHistory = async () => {
    try {
      const response = await leaveAPI.getLeaveHistory();
      setLeaves(response.data.data);
    } catch (error) {
      toast.error('Failed to load leave history');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelLeave = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this leave application?')) {
      return;
    }

    setCancelingId(id);
    try {
      await leaveAPI.cancelLeave(id);
      setLeaves(prev => prev.map(leave => 
        leave._id === id ? { ...leave, status: 'cancelled' } : leave
      ));
      toast.success('Leave application cancelled successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to cancel leave');
    } finally {
      setCancelingId(null);
    }
  };

  const handleViewDetails = (leave) => {
    setSelectedLeave(leave);
    setModalOpen(true);
  };

  const filteredLeaves = leaves.filter(leave => {
    // Apply status filter
    if (filter !== 'all' && leave.status !== filter) return false;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        leave.reason.toLowerCase().includes(term) ||
        leave.leaveType.toLowerCase().includes(term) ||
        formatDate(leave.startDate).toLowerCase().includes(term) ||
        formatDate(leave.endDate).toLowerCase().includes(term)
      );
    }
    
    return true;
  });

  const getStats = () => {
    const total = leaves.length;
    const pending = leaves.filter(l => l.status === 'pending').length;
    const approved = leaves.filter(l => l.status === 'approved').length;
    const rejected = leaves.filter(l => l.status === 'rejected').length;
    
    return { total, pending, approved, rejected };
  };

  const stats = getStats();

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave History</h1>
          <p className="text-gray-600">View and manage all your leave applications</p>
        </div>
        
        <button className="flex items-center btn-primary">
          <Download className="h-5 w-5 mr-2" />
          Export History
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-sm text-gray-600">Total Applications</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-warning-600 mt-1">{stats.pending}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-bold text-success-600 mt-1">{stats.approved}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-600">Rejected</p>
          <p className="text-2xl font-bold text-danger-600 mt-1">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by reason, type, or dates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input py-2"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leave List */}
      <div className="space-y-4">
        {filteredLeaves.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leave applications found</h3>
            <p className="text-gray-600">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'You haven\'t applied for any leaves yet'}
            </p>
          </div>
        ) : (
          filteredLeaves.map((leave) => (
            <LeaveCard
              key={leave._id}
              leave={leave}
              onCancel={handleCancelLeave}
              onViewDetails={handleViewDetails}
              isCanceling={cancelingId === leave._id}
            />
          ))
        )}
      </div>

      {/* Leave Details Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Leave Application Details"
        size="lg"
      >
        {selectedLeave && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Leave Type</p>
                <p className="font-medium text-gray-900 capitalize">
                  {selectedLeave.leaveType} Leave
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`badge ${
                  selectedLeave.status === 'approved' ? 'badge-success' :
                  selectedLeave.status === 'pending' ? 'badge-warning' :
                  selectedLeave.status === 'rejected' ? 'badge-danger' :
                  'badge-info'
                }`}>
                  {selectedLeave.status}
                </span>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-medium text-gray-900">
                  {formatDate(selectedLeave.startDate)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">End Date</p>
                <p className="font-medium text-gray-900">
                  {formatDate(selectedLeave.endDate)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-medium text-gray-900">
                  {selectedLeave.daysCount} days
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Applied On</p>
                <p className="font-medium text-gray-900">
                  {formatDate(selectedLeave.appliedDate)}
                </p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-2">Reason</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900">{selectedLeave.reason}</p>
              </div>
            </div>
            
            {selectedLeave.managerComments && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Manager Comments</p>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-yellow-800">{selectedLeave.managerComments}</p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end pt-4 border-t border-gray-200">
              {selectedLeave.status === 'pending' && (
                <button
                  onClick={() => {
                    handleCancelLeave(selectedLeave._id);
                    setModalOpen(false);
                  }}
                  disabled={cancelingId === selectedLeave._id}
                  className="flex items-center btn-danger"
                >
                  {cancelingId === selectedLeave._id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Leave
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LeaveHistory;