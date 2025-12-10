import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  MessageCircle,
  Users,
  Filter,
  Search
} from 'lucide-react';
import { leaveService } from '../services/leave';
import { authService } from '../services/auth';
import toast from 'react-hot-toast';

const TeamRequests = () => {
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState({});
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  const fetchPendingLeaves = async () => {
    try {
      setLoading(true);
      const response = await leaveService.getPendingLeaves();
      setPendingLeaves(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch pending leaves');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leaveId) => {
    try {
      await leaveService.approveLeave(leaveId, {
        status: 'approved',
        manager_comments: comments[leaveId] || 'Leave approved'
      });
      toast.success('Leave approved successfully');
      setPendingLeaves(pendingLeaves.filter(leave => leave._id !== leaveId));
      setComments({...comments, [leaveId]: ''});
    } catch (error) {
      // Error handled in service
    }
  };

  const handleReject = async (leaveId) => {
    if (!comments[leaveId]) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      await leaveService.approveLeave(leaveId, {
        status: 'rejected',
        manager_comments: comments[leaveId]
      });
      toast.success('Leave rejected successfully');
      setPendingLeaves(pendingLeaves.filter(leave => leave._id !== leaveId));
      setComments({...comments, [leaveId]: ''});
    } catch (error) {
      // Error handled in service
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getLeaveTypeColor = (type) => {
    const colors = {
      casual: 'bg-blue-100 text-blue-800',
      sick: 'bg-green-100 text-green-800',
      earned: 'bg-purple-100 text-purple-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const user = authService.getUser();
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Leave Requests</h1>
          <p className="text-gray-600">
            Review and manage leave requests from your team members
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search team members..."
              className="pl-10 input-field"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Types</option>
            <option value="casual">Casual</option>
            <option value="sick">Sick</option>
            <option value="earned">Earned</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingLeaves.length}</p>
              <p className="text-sm text-gray-500">Pending Requests</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg mr-4">
              <Filter className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {pendingLeaves.filter(l => l.leave_type === 'casual').length}
              </p>
              <p className="text-sm text-gray-500">Casual Leaves</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <Filter className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {pendingLeaves.filter(l => l.leave_type === 'sick').length}
              </p>
              <p className="text-sm text-gray-500">Sick Leaves</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Pending Approval</h2>
          <p className="text-sm text-gray-500">
            Click approve/reject to take action on leave requests
          </p>
        </div>

        {pendingLeaves.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-500">No pending leave requests at the moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {pendingLeaves.map((leave) => (
              <div key={leave._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Employee Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-primary-700">
                          {leave.user_name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{leave.user_name}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLeaveTypeColor(leave.leave_type)}`}>
                          {leave.leave_type.charAt(0).toUpperCase() + leave.leave_type.slice(1)} Leave
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Period</p>
                        <p className="font-medium">
                          {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium">
                          {leave.leave_days} day{leave.leave_days !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Reason</p>
                      <p className="text-gray-700">{leave.reason}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-3 min-w-[200px]">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(leave._id)}
                        className="flex-1 btn-primary flex items-center justify-center py-2"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(leave._id)}
                        className="flex-1 btn-secondary flex items-center justify-center py-2 border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </button>
                    </div>
                    
                    {/* Comments */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <MessageCircle className="h-4 w-4 inline mr-1" />
                        Comments (Optional)
                      </label>
                      <textarea
                        value={comments[leave._id] || ''}
                        onChange={(e) => setComments({
                          ...comments,
                          [leave._id]: e.target.value
                        })}
                        rows="2"
                        placeholder="Add comments for the employee..."
                        className="input-field text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamRequests;