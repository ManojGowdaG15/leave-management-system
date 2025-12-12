import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { leaveAPI } from '../services/api';
import { 
    Calendar, 
    Users, 
    LogOut, 
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    BarChart3
} from 'lucide-react';

const ManagerDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [teamRequests, setTeamRequests] = useState([]);
    const [teamCalendar, setTeamCalendar] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchManagerData();
    }, []);

    const fetchManagerData = async () => {
        try {
            const [requestsResponse, calendarResponse] = await Promise.all([
                leaveAPI.getTeamRequests(),
                leaveAPI.getTeamCalendar()
            ]);
            
            setTeamRequests(requestsResponse.data);
            setTeamCalendar(calendarResponse.data);
        } catch (error) {
            toast.error('Failed to fetch manager data');
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

    const handleApproveReject = async (id, status, comments = '') => {
        try {
            await leaveAPI.approveLeave(id, { status, comments });
            toast.success(`Leave application ${status} successfully`);
            fetchManagerData();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Operation failed');
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
                                    {user.name?.charAt(0) || 'M'}
                                </span>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">
                                    {user.name || 'Manager'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {user.email || 'manager@company.com'}
                                </p>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                                    {user.role || 'Manager'}
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
                            <BarChart3 className="mr-3 h-5 w-5" />
                            Dashboard
                        </button>
                        
                        <button
                            onClick={() => setActiveTab('pending-approvals')}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                                activeTab === 'pending-approvals'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <Clock className="mr-3 h-5 w-5" />
                            Pending Approvals
                            {teamRequests.length > 0 && (
                                <span className="ml-auto bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                                    {teamRequests.length}
                                </span>
                            )}
                        </button>
                        
                        <button
                            onClick={() => setActiveTab('team-calendar')}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                                activeTab === 'team-calendar'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <Calendar className="mr-3 h-5 w-5" />
                            Team Calendar
                        </button>
                        
                        <button
                            onClick={() => setActiveTab('team-members')}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                                activeTab === 'team-members'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <Users className="mr-3 h-5 w-5" />
                            Team Members
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
                            {activeTab === 'dashboard' && 'Manager Dashboard'}
                            {activeTab === 'pending-approvals' && 'Pending Approvals'}
                            {activeTab === 'team-calendar' && 'Team Calendar'}
                            {activeTab === 'team-members' && 'Team Members'}
                        </h1>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6">
                            {/* Welcome card */}
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                                <h2 className="text-2xl font-bold mb-2">
                                    Welcome, Manager {user.name}!
                                </h2>
                                <p className="text-purple-100">
                                    Manage your team's leaves and approvals from one dashboard.
                                </p>
                            </div>

                            {/* Stats cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">
                                                Pending Approvals
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                                {teamRequests.length}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                                            <Clock className="h-6 w-6 text-yellow-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">
                                                Approved This Month
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                                8
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                            <CheckCircle className="h-6 w-6 text-green-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">
                                                Team Members
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                                12
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Users className="h-6 w-6 text-blue-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pending approvals preview */}
                            <div className="bg-white rounded-lg shadow">
                                <div className="px-6 py-4 border-b flex justify-between items-center">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Recent Pending Requests
                                    </h3>
                                    <button
                                        onClick={() => setActiveTab('pending-approvals')}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        View All →
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Employee
                                                </th>
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
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {teamRequests.slice(0, 3).map((request) => (
                                                <tr key={request._id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                                <span className="text-blue-600 text-sm font-medium">
                                                                    {request.user?.name?.charAt(0) || 'E'}
                                                                </span>
                                                            </div>
                                                            <div className="ml-3">
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {request.user?.name || 'Employee'}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {request.user?.email}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {new Date(request.startDate).toLocaleDateString()} -{' '}
                                                        {new Date(request.endDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                                                        {request.leaveType}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                                        {request.reason}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleApproveReject(request._id, 'approved', 'Approved by manager')}
                                                                className="text-green-600 hover:text-green-900"
                                                            >
                                                                <CheckCircle className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleApproveReject(request._id, 'rejected', 'Please provide more details')}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                <XCircle className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {teamRequests.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            No pending approvals
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'pending-approvals' && (
                        <PendingApprovals 
                            requests={teamRequests}
                            onAction={fetchManagerData}
                        />
                    )}

                    {activeTab === 'team-calendar' && (
                        <TeamCalendar calendar={teamCalendar} />
                    )}

                    {activeTab === 'team-members' && (
                        <TeamMembers />
                    )}
                </main>
            </div>
        </div>
    );
};

export default ManagerDashboard;