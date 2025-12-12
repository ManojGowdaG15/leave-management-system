import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    AlertCircle,
    Home
} from 'lucide-react';
import ApplyLeaveForm from '../components/ApplyLeaveForm';
import LeaveHistory from '../components/LeaveHistory';

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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Bar */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center">
                                <Calendar className="h-8 w-8 text-blue-600" />
                                <span className="ml-2 text-xl font-bold text-gray-900 hidden md:inline">
                                    LeaveManage Pro
                                </span>
                            </Link>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <div className="hidden md:flex items-center space-x-1">
                                <button
                                    onClick={() => setActiveTab('dashboard')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                                        activeTab === 'dashboard'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <Home className="h-5 w-5 inline mr-1" />
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => setActiveTab('apply-leave')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                                        activeTab === 'apply-leave'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <PlusCircle className="h-5 w-5 inline mr-1" />
                                    Apply Leave
                                </button>
                                <button
                                    onClick={() => setActiveTab('leave-history')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                                        activeTab === 'leave-history'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <FileText className="h-5 w-5 inline mr-1" />
                                    History
                                </button>
                            </div>
                            
                            <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-600 font-semibold text-sm">
                                        {user.name?.charAt(0) || 'E'}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="ml-4 text-gray-700 hover:text-red-600"
                                    title="Logout"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Dashboard Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back, {user.name || 'Employee'}!
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Manage your leaves and track applications from your dashboard.
                    </p>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden mb-6">
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                                activeTab === 'dashboard'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                            <Home className="h-4 w-4 inline mr-1" />
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('apply-leave')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                                activeTab === 'apply-leave'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                            <PlusCircle className="h-4 w-4 inline mr-1" />
                            Apply Leave
                        </button>
                        <button
                            onClick={() => setActiveTab('leave-history')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                                activeTab === 'leave-history'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                            <FileText className="h-4 w-4 inline mr-1" />
                            History
                        </button>
                    </div>
                </div>

                {/* Content based on active tab */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        {/* Leave balance cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-xl shadow p-6 border border-blue-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            Casual Leaves
                                        </p>
                                        <p className="text-3xl font-bold text-blue-600 mt-2">
                                            {leaveBalance?.casualLeaves || 0}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Available</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Calendar className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow p-6 border border-green-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            Sick Leaves
                                        </p>
                                        <p className="text-3xl font-bold text-green-600 mt-2">
                                            {leaveBalance?.sickLeaves || 0}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Available</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                        <Calendar className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow p-6 border border-purple-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            Earned Leaves
                                        </p>
                                        <p className="text-3xl font-bold text-purple-600 mt-2">
                                            {leaveBalance?.earnedLeaves || 0}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Available</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                        <Calendar className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent applications */}
                        <div className="bg-white rounded-xl shadow">
                            <div className="px-6 py-4 border-b">
                                <h3 className="text-lg font-semibold text-gray-900">
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
                                            <tr key={application._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(application.startDate).toLocaleDateString()} -{' '}
                                                    {new Date(application.endDate).toLocaleDateString()}
                                                    <div className="text-xs text-gray-500">
                                                        {application.daysCount} day(s)
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                                                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                                        {application.leaveType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    <div className="max-w-xs truncate" title={application.reason}>
                                                        {application.reason}
                                                    </div>
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
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {leaveApplications.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        <Calendar className="h-12 w-12 mx-auto text-gray-300" />
                                        <p className="mt-4">No leave applications yet</p>
                                        <button
                                            onClick={() => setActiveTab('apply-leave')}
                                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                                        >
                                            <PlusCircle className="mr-2 h-5 w-5" />
                                            Apply for your first leave
                                        </button>
                                    </div>
                                )}
                            </div>
                            {leaveApplications.length > 5 && (
                                <div className="px-6 py-4 border-t text-center">
                                    <button
                                        onClick={() => setActiveTab('leave-history')}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        View all applications →
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Quick stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-xl shadow p-6">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Approved</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {leaveApplications.filter(app => app.status === 'approved').length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-xl shadow p-6">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                                        <Clock className="h-5 w-5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Pending</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {leaveApplications.filter(app => app.status === 'pending').length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-xl shadow p-6">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Applications</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {leaveApplications.length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'apply-leave' && (
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white rounded-xl shadow p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Apply for Leave</h2>
                            <ApplyLeaveForm onSuccess={() => {
                                fetchDashboardData();
                                setActiveTab('dashboard');
                            }} />
                        </div>
                    </div>
                )}

                {activeTab === 'leave-history' && (
                    <div className="bg-white rounded-xl shadow">
                        <div className="px-6 py-4 border-b">
                            <h2 className="text-xl font-bold text-gray-900">Leave History</h2>
                            <p className="text-gray-600 text-sm mt-1">
                                All your leave applications in one place
                            </p>
                        </div>
                        <LeaveHistory 
                            applications={leaveApplications}
                            onCancel={fetchDashboardData}
                        />
                    </div>
                )}
            </main>
        </div>
    );
};

export default EmployeeDashboard;