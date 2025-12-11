import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  CalendarIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  EyeIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

const LeaveHistory = ({ user }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all');
  const [totalLeaves, setTotalLeaves] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLeaveHistory();
  }, [currentPage, filter]);

  const fetchLeaveHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/leave/history', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: currentPage,
          limit: itemsPerPage,
          filter: filter !== 'all' ? filter : undefined
        }
      });
      
      console.log('Leave history response:', response.data);
      
      // Map data to match frontend structure
      const mappedLeaves = response.data.leaves.map(leave => ({
        id: leave._id,
        leave_type: leave.leaveType,
        start_date: leave.startDate,
        end_date: leave.endDate,
        reason: leave.reason,
        status: leave.status,
        manager_comments: leave.managerComments,
        contact_during_leave: leave.contactDuringLeave,
        applied_date: leave.appliedDate,
        approved_date: leave.approvedDate
      }));
      
      setLeaves(mappedLeaves);
      setTotalPages(response.data.totalPages);
      setTotalLeaves(response.data.total);
      setLoading(false);
    } catch (error) {
      console.error('Leave history error:', error.response || error);
      toast.error('Failed to load leave history');
      setLoading(false);
    }
  };

  const handleCancelLeave = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this leave? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/leave/cancel/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Leave cancelled successfully');
      fetchLeaveHistory(); // Refresh the list
    } catch (error) {
      console.error('Cancel leave error:', error.response || error);
      toast.error(error.response?.data?.error || 'Failed to cancel leave');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Pending': {
        icon: ClockIcon,
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      'Approved': {
        icon: CheckCircleIcon,
        color: 'bg-green-100 text-green-800 border-green-200'
      },
      'Rejected': {
        icon: XCircleIcon,
        color: 'bg-red-100 text-red-800 border-red-200'
      },
      'Cancelled': {
        icon: XCircleIcon,
        color: 'bg-gray-100 text-gray-800 border-gray-200'
      }
    };

    const badge = badges[status] || badges.Pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${badge.color}`}>
        <Icon className="h-4 w-4 mr-1" />
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) + ' ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const exportToCSV = () => {
    const headers = ['Leave Type', 'Start Date', 'End Date', 'Duration', 'Status', 'Reason', 'Applied On', 'Manager Comments'];
    const csvData = leaves.map(leave => [
      leave.leave_type,
      formatDate(leave.start_date),
      formatDate(leave.end_date),
      `${calculateDays(leave.start_date, leave.end_date)} days`,
      leave.status,
      leave.reason.substring(0, 50) + (leave.reason.length > 50 ? '...' : ''),
      formatDate(leave.applied_date),
      leave.manager_comments || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leave-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Leave history exported successfully');
  };

  const getStatusCount = (status) => {
    return leaves.filter(leave => leave.status === status).length;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Leave History</h1>
        <p className="text-gray-600 mt-2">View all your past and current leave applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Leaves</p>
              <h3 className="text-2xl font-bold text-gray-800">{totalLeaves}</h3>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <h3 className="text-2xl font-bold text-yellow-600">{getStatusCount('Pending')}</h3>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <h3 className="text-2xl font-bold text-green-600">{getStatusCount('Approved')}</h3>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected/Cancelled</p>
              <h3 className="text-2xl font-bold text-red-600">
                {getStatusCount('Rejected') + getStatusCount('Cancelled')}
              </h3>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircleIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Export Controls */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filter by Status
              </label>
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setCurrentPage(1); // Reset to first page when filter changes
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-auto"
              >
                <option value="all">All Leaves</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Showing {leaves.length} of {totalLeaves} total leaves
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Leaves Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading leave history...</p>
          </div>
        ) : leaves.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Leave Applications</h3>
            <p className="text-gray-600">You haven't applied for any leaves yet.</p>
            <button
              onClick={() => window.location.href = '/apply-leave'}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply for Your First Leave
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaves.map((leave, index) => (
                  <tr key={leave.id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${
                          leave.leave_type === 'Casual' ? 'bg-blue-100' :
                          leave.leave_type === 'Sick' ? 'bg-yellow-100' :
                          'bg-green-100'
                        }`}>
                          <CalendarIcon className={`h-5 w-5 ${
                            leave.leave_type === 'Casual' ? 'text-blue-600' :
                            leave.leave_type === 'Sick' ? 'text-yellow-600' :
                            'text-green-600'
                          }`} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{leave.leave_type}</div>
                          {leave.manager_comments && (
                            <div className="text-xs text-gray-500 mt-1">
                              <span className="font-medium">Comments:</span> {leave.manager_comments}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{formatDate(leave.start_date)}</div>
                      <div className="text-sm text-gray-600">to {formatDate(leave.end_date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900 font-medium">
                        {calculateDays(leave.start_date, leave.end_date)} days
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-gray-900 line-clamp-2">{leave.reason}</p>
                        {leave.contact_during_leave && (
                          <p className="text-xs text-gray-500 mt-1">
                            📞 Contact: {leave.contact_during_leave}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(leave.status)}
                      {leave.approved_date && leave.status === 'Approved' && (
                        <div className="text-xs text-gray-500 mt-1">
                          Approved: {formatDate(leave.approved_date)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{formatDate(leave.applied_date)}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(leave.applied_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            // Show leave details modal
                            toast.success(`Viewing details for ${leave.leave_type} leave`);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        {leave.status === 'Pending' && (
                          <button
                            onClick={() => handleCancelLeave(leave.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancel Leave"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {leaves.length > 0 && (
        <div className="flex items-center justify-between mt-6 bg-white rounded-xl shadow border border-gray-200 p-4">
          <div className="text-sm text-gray-700">
            Page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
            <span className="ml-4">({totalLeaves} total records)</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="h-4 w-4 mr-2" />
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRightIcon className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-800 mb-4">Leave History Help</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Status Meanings:</h4>
            <ul className="text-blue-700 space-y-1 text-sm">
              <li className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-2" />
                <span><strong>Pending:</strong> Awaiting manager approval</span>
              </li>
              <li className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                <span><strong>Approved:</strong> Leave has been approved</span>
              </li>
              <li className="flex items-center">
                <XCircleIcon className="h-4 w-4 mr-2" />
                <span><strong>Rejected:</strong> Leave was not approved</span>
              </li>
              <li className="flex items-center">
                <XCircleIcon className="h-4 w-4 mr-2" />
                <span><strong>Cancelled:</strong> You cancelled the leave</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Quick Actions:</h4>
            <ul className="text-blue-700 space-y-1 text-sm">
              <li>• Click the eye icon to view detailed information</li>
              <li>• Cancel pending leaves using the trash icon</li>
              <li>• Export your leave history as CSV for records</li>
              <li>• Use filters to view specific status leaves</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveHistory;