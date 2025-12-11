import React from 'react';
import { Calendar, Clock, User, MessageSquare, XCircle } from 'lucide-react';
import { formatDate, getStatusBadge } from '../../utils/helpers';

const LeaveCard = ({ leave, onCancel, onViewDetails, isManager = false }) => {
  const statusBadge = getStatusBadge(leave.status);
  
  const getLeaveTypeColor = (type) => {
    switch (type) {
      case 'casual': return 'bg-blue-100 text-blue-800';
      case 'sick': return 'bg-red-100 text-red-800';
      case 'earned': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="card-hover">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getLeaveTypeColor(leave.leaveType)}`}>
                {leave.leaveType} Leave
              </div>
              <span className={`badge ${statusBadge.className}`}>
                {statusBadge.label}
              </span>
            </div>
            
            {isManager && leave.userId && (
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-1" />
                <span>{leave.userId.name}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</span>
              <span className="mx-2">•</span>
              <Clock className="h-4 w-4 mr-2" />
              <span>{leave.daysCount} days</span>
            </div>
            
            {leave.reason && (
              <div className="flex items-start text-sm text-gray-700">
                <MessageSquare className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <p className="line-clamp-2">{leave.reason}</p>
              </div>
            )}
            
            {leave.managerComments && (
              <div className="flex items-start text-sm bg-yellow-50 p-2 rounded">
                <MessageSquare className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-yellow-600" />
                <p className="text-yellow-700">{leave.managerComments}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Applied on {formatDate(leave.appliedDate)}
        </div>
        
        <div className="flex space-x-2">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(leave)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View Details
            </button>
          )}
          
          {onCancel && leave.status === 'pending' && (
            <button
              onClick={() => onCancel(leave._id)}
              className="flex items-center text-sm text-red-600 hover:text-red-700 font-medium"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveCard;