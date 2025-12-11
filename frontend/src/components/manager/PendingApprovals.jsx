import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const PendingApprovals = ({ leaves, onApprove, onReject, loading }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [comments, setComments] = useState({});
  const [processingId, setProcessingId] = useState(null);

  const handleAction = async (id, action) => {
    setProcessingId(id);
    const comment = comments[id] || '';
    if (action === 'approve') {
      await onApprove(id, comment);
    } else {
      await onReject(id, comment);
    }
    setProcessingId(null);
    setComments(prev => ({ ...prev, [id]: '' }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Pending Approvals</h2>
          <p className="text-sm text-gray-600">
            {leaves.length} pending leave requests
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Awaiting your review</span>
        </div>
      </div>

      {leaves.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-600">No pending leave requests at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaves.map((leave) => (
            <div key={leave._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {leave.userId?.name || 'Employee'}
                    </h3>
                    <p className="text-sm text-gray-600">{leave.userId?.department}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(leave.status)}`}>
                        {leave.leaveType} Leave • {leave.daysCount} days
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleAction(leave._id, 'approve')}
                    disabled={processingId === leave._id}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {processingId === leave._id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleAction(leave._id, 'reject')}
                    disabled={processingId === leave._id}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </button>
                  <button
                    onClick={() => setExpandedId(expandedId === leave._id ? null : leave._id)}
                    className="p-2 text-gray-600 hover:text-gray-900"
                  >
                    {expandedId === leave._id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {expandedId === leave._id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Reason for Leave</h4>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{leave.reason}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Add Comment (Optional)</h4>
                    <textarea
                      value={comments[leave._id] || ''}
                      onChange={(e) => setComments(prev => ({
                        ...prev,
                        [leave._id]: e.target.value
                      }))}
                      className="input-field min-h-[80px]"
                      placeholder="Add comments for the employee..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => handleAction(leave._id, 'approve')}
                      disabled={processingId === leave._id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {processingId === leave._id ? 'Processing...' : 'Approve with Comment'}
                    </button>
                    <button
                      onClick={() => handleAction(leave._id, 'reject')}
                      disabled={processingId === leave._id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject with Comment
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingApprovals;