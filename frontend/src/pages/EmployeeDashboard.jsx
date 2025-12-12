import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { leaveAPI } from '../services/api';
import { 
    Calendar, 
    FileText, 
    LogOut, 
    PlusCircle,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';

const EmployeeDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [leaveBalance, setLeaveBalance] = useState(null);
    const [leaveApplications, setLeaveApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [balanceResponse, applicationsResponse] = await Promise.all([
                leaveAPI.getLeaveBalance(),
                leaveAPI.getMyApplications()
            ]);
            
            setLeaveBalance(balanceResponse.data);
            setLeaveApplications(applicationsResponse.data);
        } catch (error) {
            toast.error('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        toast.success('Logged out successfully');
    };

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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-center h-16 px-4 border-b">
                        <Calendar className="h-8 w-8 text-blue-600" />
                        <span className="ml-2 text-xl font-bold text-gray-900">
                            LeaveManage Pro
                        </span>
                    </div>

                    {/* User info */}
                    <div className="px-4 py-6 border-b">
                        <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-semibold">
                                    {user.name?.charAt(0) || 'E'}
                                </span>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">
                                    {user.name || 'Employee'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {user.email || 'employee@company.com'}
                                </p>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                                    {user.role || 'Employee'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-2 py-4 space-y-1">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                                activeTab === 'dashboard'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <Calendar className="mr-3 h-5 w-5" />
                            Dashboard
                        </button>
                        
                        <button
                            onClick={() => setActiveTab('apply-leave')}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                                activeTab === 'apply-leave'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <PlusCircle className="mr-3 h-5 w-5" />
                            Apply Leave
                        </button>
                        
                        <button
                            onClick={() => setActiveTab('leave-history')}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                                activeTab === 'leave-history'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <FileText className="mr-3 h-5 w-5" />
                            Leave History
                        </button>
                    </nav>

                    {/* Logout button */}
                    <div className="p-4 border-t">
                        <button
                            onClick={handleLogout}
                            className="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md w-full"
                        >
                            <LogOut className="mr-3 h-5 w-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="pl-64">
                {/* Header */}
                <header className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <h1 className="text-2xl font-semibold text-gray-900">
                            {activeTab === 'dashboard' && 'Dashboard'}
                            {activeTab === 'apply-leave' && 'Apply for Leave'}
                            {activeTab === 'leave-history' && 'Leave History'}
                        </h1>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6">
                            {/* Welcome card */}
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                                <h2 className="text-2xl font-bold mb-2">
                                    Welcome back, {user.name || 'Employee'}!
                                </h2>
                                <p className="text-blue-100">
                                    Manage your leaves and track your applications from one place.
                                </p>
                            </div>

                            {/* Leave balance cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">
                                                Casual Leaves
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                                {leaveBalance?.casualLeaves || 0}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Calendar className="h-6 w-6 text-blue-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">
                                                Sick Leaves
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                                {leaveBalance?.sickLeaves || 0}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                            <Calendar className="h-6 w-6 text-green-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">
                                                Earned Leaves
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                                {leaveBalance?.earnedLeaves || 0}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                            <Calendar className="h-6 w-6 text-purple-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent applications */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="px-6 py-4 border-b">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Recent Leave Applications
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Dates
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Reason
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Applied On
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {leaveApplications.slice(0, 5).map((application) => (
                                                <tr key={application._id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {new Date(application.startDate).toLocaleDateString()} -{' '}
                                                        {new Date(application.endDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                                                        {application.leaveType}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                                        {application.reason}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                                            {getStatusIcon(application.status)}
                                                            <span className="ml-1 capitalize">{application.status}</span>
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(application.appliedDate).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {leaveApplications.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            No leave applications yet
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick actions */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Quick Actions
                                </h3>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => setActiveTab('apply-leave')}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        <PlusCircle className="mr-2 h-5 w-5" />
                                        Apply for Leave
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('leave-history')}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        <FileText className="mr-2 h-5 w-5" />
                                        View All Applications
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'apply-leave' && (
                        <div className="max-w-2xl mx-auto">
                            <ApplyLeaveForm onSuccess={fetchDashboardData} />
                        </div>
                    )}

                    {activeTab === 'leave-history' && (
                        <LeaveHistory 
                            applications={leaveApplications}
                            onCancel={fetchDashboardData}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

export default EmployeeDashboard;