import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const TeamRequests = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rejectReasons, setRejectReasons] = useState({});
  const [totalRequests, setTotalRequests] = useState(0);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchPendingRequests();
  }, [currentPage]);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/leave/pending', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: currentPage, limit: itemsPerPage }
      });
      
      console.log('Pending requests response:', response.data);
      
      // Map data to match frontend structure
      const mappedRequests = response.data.requests.map(request => ({
        id: request._id,
        employee_name: request.employee_name,
        employee_email: request.employee_email,
        leave_type: request.leaveType,
        start_date: request.startDate,
        end_date: request.endDate,
        reason: request.reason,
        days: request.days,
        contact_during_leave: request.contactDuringLeave,
        applied_date: request.appliedDate
      }));
      
      setRequests(mappedRequests);
      setTotalPages(response.data.totalPages);
      setTotalRequests(response.data.total);
      setLoading(false);
    } catch (error) {
      console.error('Pending requests error:', error.response || error);
      toast.error('Failed to load pending requests');
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this leave?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/leave/approve/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Leave approved successfully');
      fetchPendingRequests(); // Refresh the list
    } catch (error) {
      console.error('Approve error:', error.response || error);
      toast.error(error.response?.data?.error || 'Failed to approve leave');
    }
  };

  const handleReject = async (id) => {
    const reason = rejectReasons[id]?.trim();
    if (!reason) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    if (!window.confirm('Are you sure you want to reject this leave?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/leave/reject/${id}`, { reason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Leave rejected successfully');
      
      // Clear the reason input
      setRejectReasons(prev => {
        const newReasons = { ...prev };
        delete newReasons[id];
        return newReasons;
      });
      
      fetchPendingRequests(); // Refresh the list
    } catch (error) {
      console.error('Reject error:', error.response || error);
      toast.error(error.response?.data?.error || 'Failed to reject leave');
    }
  };

  const handleRejectReasonChange = (id, value) => {
    setRejectReasons(prev => ({
      ...prev,
      [id]: value
    }));
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

  const getLeaveTypeColor = (type) => {
    const colors = {
      'Casual': 'bg-blue-100 text-blue-800 border-blue-200',
      'Sick': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Earned': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[type] || colors.Casual;
  };

  const handleApproveAllVisible = () => {
    if (requests.length === 0) {
      toast.error('No requests to approve');
      return;
    }

    if (window.confirm(`Are you sure you want to approve all ${requests.length} visible requests?`)) {
      requests.forEach(request => {
        handleApprove(request.id);
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Team Leave Requests</h1>
        <p className="text-gray-600 mt-2">Review and manage leave requests from your team</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Requests</p>
              <p className="text-3xl font-bold text-gray-800">{totalRequests}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">On This Page</p>
              <p className="text-3xl font-bold text-gray-800">{requests.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Days/Request</p>
              <p className="text-3xl font-bold text-gray-800">
                {requests.length > 0 
                  ? (requests.reduce((acc, req) => acc + (req.days || 0), 0) / requests.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CalendarIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {requests.length > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-800">Bulk Actions</h4>
              <p className="text-sm text-blue-600">Quickly approve all visible requests</p>
            </div>
            <button
              onClick={handleApproveAllVisible}
              className="mt-2 md:mt-0 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Approve All ({requests.length})
            </button>
          </div>
        </div>
      )}

      {/* Requests Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading pending requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircleIcon className="h-16 w-16 text-green-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">All Caught Up!</h3>
            <p className="text-gray-600">No pending leave requests from your team.</p>
            <p className="text-sm text-gray-400 mt-1">All requests have been reviewed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request, index) => (
                  <tr key={request.id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                          {request.employee_name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{request.employee_name || 'Unknown Employee'}</div>
                          <div className="text-sm text-gray-500">{request.employee_email || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getLeaveTypeColor(request.leave_type)}`}>
                          {request.leave_type}
                        </div>
                        <div className="ml-4">
                          <div className="text-gray-900">{formatDate(request.start_date)}</div>
                          <div className="text-sm text-gray-600">to {formatDate(request.end_date)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900 font-medium">
                        {request.days || 1} day(s)
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-gray-900 line-clamp-2">{request.reason}</p>
                        {request.contact_during_leave && (
                          <p className="text-xs text-gray-500 mt-1 flex items-center">
                            <ChatBubbleLeftIcon className="h-3 w-3 mr-1" />
                            Contact: {request.contact_during_leave}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{formatDate(request.applied_date)}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(request.applied_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-3">
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-2" />
                          Approve
                        </button>
                        
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Rejection reason..."
                            value={rejectReasons[request.id] || ''}
                            onChange={(e) => handleRejectReasonChange(request.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                          {rejectReasons[request.id] && (
                            <button
                              onClick={() => handleReject(request.id)}
                              className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            >
                              <XCircleIcon className="h-4 w-4 mr-2" />
                              Reject with Reason
                            </button>
                          )}
                        </div>
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
      {requests.length > 0 && (
        <div className="flex items-center justify-between mt-6 bg-white rounded-xl shadow border border-gray-200 p-4">
          <div className="text-sm text-gray-700">
            Showing page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
            <span className="ml-4">({totalRequests} total pending requests)</span>
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

      {/* Approval Guidelines */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-800 mb-4">Approval Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-start">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-800">When to Approve</h4>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• Adequate notice period (at least 1 day for casual leaves)</li>
                  <li>• Sufficient leave balance available</li>
                  <li>• Not overlapping with critical project deadlines</li>
                  <li>• Proper documentation for sick leaves (if applicable)</li>
                </ul>
              </div>
            </div>
            <div className="flex items-start">
              <UserIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-800">Team Coverage</h4>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• Ensure team has adequate coverage</li>
                  <li>• Check if multiple team members are on leave</li>
                  <li>• Consider project deadlines and deliverables</li>
                  <li>• Balance between team needs and employee well-being</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start">
              <XCircleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-800">When to Reject</h4>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• Insufficient notice period</li>
                  <li>• Overlapping with critical team deadlines</li>
                  <li>• Insufficient leave balance</li>
                  <li>• Multiple team members requesting same dates</li>
                  <li>• Missing required documentation</li>
                </ul>
              </div>
            </div>
            <div className="flex items-start">
              <ChatBubbleLeftIcon className="h-5 w-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-800">Communication Tips</h4>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• Always provide clear reasons for rejection</li>
                  <li>• Suggest alternative dates if possible</li>
                  <li>• Be respectful and professional</li>
                  <li>• Document reasons for future reference</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamRequests;