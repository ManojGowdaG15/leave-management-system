import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { leaveAPI } from '../services/api';
import { 
    User, 
    Calendar, 
    CheckCircle, 
    XCircle, 
    MessageSquare,
    Filter,
    Search,
    Clock
} from 'lucide-react';

const PendingApprovals = ({ requests = [], onAction }) => {
    const [comments, setComments] = useState({});
    const [loading, setLoading] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    const handleApproveReject = async (id, status) => {
        const comment = comments[id] || '';
        
        if (status === 'rejected' && !comment.trim()) {
            toast.error('Please provide a reason for rejection');
            return;
        }

        setLoading(prev => ({ ...prev, [id]: true }));

        try {
            await leaveAPI.approveLeave(id, { 
                status, 
                comments: comment 
            });
            toast.success(`Leave application ${status} successfully`);
            setComments(prev => ({ ...prev, [id]: '' }));
            if (onAction) onAction();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Operation failed');
        } finally {
            setLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    const filteredRequests = requests.filter(request => {
        if (!searchTerm) return true;
        
        const term = searchTerm.toLowerCase();
        return (
            request.user?.name?.toLowerCase().includes(term) ||
            request.reason.toLowerCase().includes(term) ||
            request.leaveType.toLowerCase().includes(term)
        );
    });

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Pending Approvals</h2>
                <p className="text-gray-600 mt-1">
                    Review and manage leave requests from your team members
                </p>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by employee name, reason, or type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Requests Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => (
                        <div key={request._id} className="bg-white rounded-xl shadow border border-gray-200 p-6">
                            {/* Employee Info */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <span className="text-blue-600 font-semibold">
                                            {request.user?.name?.charAt(0) || 'E'}
                                        </span>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">
                                            {request.user?.name || 'Employee'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {request.user?.email || 'employee@company.com'}
                                        </p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 capitalize">
                                    {request.leaveType}
                                </span>
                            </div>

                            {/* Leave Details */}
                            <div className="mb-4">
                                <div className="flex items-center text-gray-600 mb-2">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    <span className="text-sm">
                                        {new Date(request.startDate).toLocaleDateString()} -{' '}
                                        {new Date(request.endDate).toLocaleDateString()}
                                    </span>
                                    <span className="ml-auto text-sm font-medium">
                                        {request.daysCount || 1} day(s)
                                    </span>
                                </div>
                                
                                <div className="mt-3">
                                    <p className="text-sm text-gray-600 mb-1">Reason:</p>
                                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg text-sm">
                                        {request.reason}
                                    </p>
                                </div>
                            </div>

                            {/* Comment Input */}
                            <div className="mb-4">
                                <div className="flex items-center text-gray-600 mb-2">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    <span className="text-sm font-medium">Comments (optional)</span>
                                </div>
                                <textarea
                                    value={comments[request._id] || ''}
                                    onChange={(e) => setComments(prev => ({
                                        ...prev,
                                        [request._id]: e.target.value
                                    }))}
                                    placeholder="Add comments for the employee..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    rows="2"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => handleApproveReject(request._id, 'approved')}
                                    disabled={loading[request._id]}
                                    className="flex-1 flex items-center justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading[request._id] === 'approved' ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Approve
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleApproveReject(request._id, 'rejected')}
                                    disabled={loading[request._id]}
                                    className="flex-1 flex items-center justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading[request._id] === 'rejected' ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        <>
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Reject
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-2 text-center py-12">
                        <Clock className="h-12 w-12 mx-auto text-gray-300" />
                        <p className="mt-4 text-gray-500">
                            {requests.length === 0 
                                ? 'No pending leave requests' 
                                : 'No requests match your search'}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                            All caught up! Check back later for new requests.
                        </p>
                    </div>
                )}
            </div>

            {/* Summary */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-blue-900">
                            Total Pending Requests
                        </p>
                        <p className="text-2xl font-bold text-blue-900">
                            {requests.length}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-blue-700">
                            Last updated: {new Date().toLocaleTimeString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PendingApprovals;