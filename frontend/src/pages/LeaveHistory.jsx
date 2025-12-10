import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  XCircle, 
  Download,
  MoreVertical,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { leaveService } from '../services/leave';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const LeaveHistory = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: 'all',
    leaveType: 'all',
    search: '',
    startDate: null,
    endDate: null
  });
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  const fetchLeaveHistory = async () => {
    try {
      setLoading(true);
      const response = await leaveService.getHistory();
      setLeaves(response.data || []);
    } catch (error) {
      // Error handled in service
    } finally {
      setLoading(false);
    }
  };

  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm('Are you sure you want to cancel this leave application?')) {
      return;
    }

    try {
      await leaveService.cancelLeave(leaveId);
      setLeaves(leaves.map(leave => 
        leave._id === leaveId 
          ? { ...leave, status: 'cancelled' }
          : leave
      ));
      toast.success('Leave cancelled successfully');
    } catch (error) {
      // Error handled in service
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'badge-pending', icon: Clock, text: 'Pending' },
      approved: { color: 'badge-approved', icon: CheckCircle, text: 'Approved' },
      rejected: { color: 'badge-rejected', icon: XCircle, text: 'Rejected' },
      cancelled: { color: 'badge-cancelled', icon: XCircle, text: 'Cancelled' },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`badge ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const getLeaveTypeBadge = (type) => {
    const typeConfig = {
      casual: { color: 'bg-blue-100 text-blue-800', text: 'Casual' },
      sick: { color: 'bg-green-100 text-green-800', text: 'Sick' },
      earned: { color: 'bg-purple-100 text-purple-800', text: 'Earned' },
    };
    
    const config = typeConfig[type] || { color: 'bg-gray-100 text-gray-800', text: type };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Calendar className="h-3 w-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const filteredLeaves = leaves.filter(leave => {
    if (filter.status !== 'all' && leave.status !== filter.status) return false;
    if (filter.leaveType !== 'all' && leave.leave_type !== filter.leaveType) return false;
    if (filter.search && !leave.reason.toLowerCase().includes(filter.search.toLowerCase())) return false;
    if (filter.startDate && new Date(leave.start_date) < filter.startDate) return false;
    if (filter.endDate && new Date(leave.end_date) > filter.endDate) return false;
    return true;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave History</h1>
          <p className="text-gray-600">Track all your leave applications and their status</p>
        </div>
        <button className="btn-primary flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by reason..."
              value={filter.search}
              onChange={(e) => setFilter({...filter, search: e.target.value})}
              className="pl-10 input-field"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filter.status}
            onChange={(e) => setFilter({...filter, status: e.target.value})}
            className="input-field"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Leave Type Filter */}
          <select
            value={filter.leaveType}
            onChange={(e) => setFilter({...filter, leaveType: e.target.value})}
            className="input-field"
          >
            <option value="all">All Types</option>
            <option value="casual">Casual</option>
            <option value="sick">Sick</option>
            <option value="earned">Earned</option>
          </select>

          {/* Date Range */}
          <div className="flex gap-2">
            <DatePicker
              selected={filter.startDate}
              onChange={(date) => setFilter({...filter, startDate: date})}
              placeholderText="From Date"
              className="input-field text-sm"
              dateFormat="dd/MM/yy"
            />
            <DatePicker
              selected={filter.endDate}
              onChange={(date) => setFilter({...filter, endDate: date})}
              placeholderText="To Date"
              className="input-field text-sm"
              dateFormat="dd/MM/yy"
            />
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{leaves.length}</p>
          <p className="text-sm text-gray-500">Total Applications</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {leaves.filter(l => l.status === 'pending').length}
          </p>
          <p className="text-sm text-gray-500">Pending</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {leaves.filter(l => l.status === 'approved').length}
          </p>
          <p className="text-sm text-gray-500">Approved</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">
            {leaves.filter(l => l.status === 'cancelled').length}
          </p>
          <p className="text-sm text-gray-500">Cancelled</p>
        </div>
      </div>

      {/* Leave Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leave Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied On
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg">No leave applications found</p>
                      <p className="text-sm mt-1">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getLeaveTypeBadge(leave.leave_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(leave.start_date)}
                      </div>
                      <div className="text-sm text-gray-500">
                        to {formatDate(leave.end_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                        {leave.leave_days} day{leave.leave_days !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(leave.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(leave.applied_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedLeave(leave);
                            setShowModal(true);
                          }}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {leave.status === 'pending' && (
                          <button
                            onClick={() => handleCancelLeave(leave._id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                            title="Cancel Leave"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showModal && selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Leave Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Leave Type
                  </label>
                  <div className="text-lg font-semibold text-gray-900">
                    {selectedLeave.leave_type.charAt(0).toUpperCase() + selectedLeave.leave_type.slice(1)}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Status
                  </label>
                  <div className="mt-1">
                    {getStatusBadge(selectedLeave.status)}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Start Date
                  </label>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatDate(selectedLeave.start_date)}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    End Date
                  </label>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatDate(selectedLeave.end_date)}
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Reason
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{selectedLeave.reason}</p>
                </div>
              </div>
              
              {selectedLeave.manager_comments && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Manager Comments
                  </label>
                  <div className={`rounded-lg p-4 ${
                    selectedLeave.status === 'approved' 
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <p className="text-gray-700">{selectedLeave.manager_comments}</p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveHistory;