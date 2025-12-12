import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { leaveAPI } from '../services/api';
import { 
    Calendar, 
    CheckCircle, 
    XCircle, 
    Clock, 
    AlertCircle,
    Filter,
    Download,
    Search,
    Trash2
} from 'lucide-react';

const LeaveHistory = ({ applications = [], onCancel }) => {
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState({});

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'rejected': return <XCircle className="h-5 w-5 text-red-500" />;
            case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'cancelled': return <AlertCircle className="h-5 w-5 text-gray-500" />;
            default: return <Clock className="h-5 w-5 text-yellow-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-gray-100 text-gray-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this leave application?')) {
            return;
        }

        setLoading(prev => ({ ...prev, [id]: true }));

        try {
            await leaveAPI.cancelApplication(id);
            toast.success('Leave application cancelled successfully');
            if (onCancel) onCancel();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to cancel application');
        } finally {
            setLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    // Filter applications
    const filteredApplications = applications.filter(app => {
        // Filter by status
        if (filterStatus !== 'all' && app.status !== filterStatus) {
            return false;
        }
        
        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return (
                app.reason.toLowerCase().includes(term) ||
                app.leaveType.toLowerCase().includes(term)
            );
        }
        
        return true;
    });

    return (
        <div className="p-6">
            {/* Filters and Search */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by reason or type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <Filter className="h-5 w-5 text-gray-500" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                </button>
            </div>

            {/* Applications Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date Range
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Reason
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
                        {filteredApplications.length > 0 ? (
                            filteredApplications.map((application) => (
                                <tr key={application._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {new Date(application.startDate).toLocaleDateString()}
                                        </div>
                                        <div className="text-sm text-gray-500">to</div>
                                        <div className="text-sm text-gray-900">
                                            {new Date(application.endDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                                            {application.leaveType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 max-w-xs">
                                            {application.reason}
                                        </div>
                                        {application.managerComments && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                <span className="font-medium">Manager: </span>
                                                {application.managerComments}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {application.daysCount || 1} day(s)
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                            {getStatusIcon(application.status)}
                                            <span className="ml-1 capitalize">{application.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(application.appliedDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {application.status === 'pending' && (
                                            <button
                                                onClick={() => handleCancel(application._id)}
                                                disabled={loading[application._id]}
                                                className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Cancel application"
                                            >
                                                {loading[application._id] ? (
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                                                ) : (
                                                    <Trash2 className="h-5 w-5" />
                                                )}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center">
                                    <Calendar className="h-12 w-12 mx-auto text-gray-300" />
                                    <p className="mt-4 text-gray-500">
                                        {applications.length === 0 
                                            ? 'No leave applications found' 
                                            : 'No applications match your filters'}
                                    </p>
                                    {applications.length === 0 && (
                                        <p className="text-sm text-gray-400 mt-2">
                                            Start by applying for a leave from the dashboard
                                        </p>
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Summary */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-900">Total Applications</p>
                    <p className="text-2xl font-bold text-blue-900">{applications.length}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-green-900">Approved</p>
                    <p className="text-2xl font-bold text-green-900">
                        {applications.filter(app => app.status === 'approved').length}
                    </p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-yellow-900">Pending</p>
                    <p className="text-2xl font-bold text-yellow-900">
                        {applications.filter(app => app.status === 'pending').length}
                    </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-900">Cancelled</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {applications.filter(app => app.status === 'cancelled').length}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LeaveHistory;