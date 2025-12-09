import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    Calendar, 
    LogOut, 
    User, 
    Clock, 
    CheckCircle, 
    XCircle,
    AlertCircle,
    Plus
} from 'lucide-react';
import LeaveForm from '../components/LeaveForm';
import LeaveList from '../components/LeaveList';
import axios from 'axios';

function EmployeeDashboard() {
    const { user, logout } = useAuth();
    const [showLeaveForm, setShowLeaveForm] = useState(false);
    const [leaves, setLeaves] = useState([]);
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/leaves/my-leaves', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setLeaves(response.data);
            
            // Calculate stats
            const pending = response.data.filter(l => l.status === 'pending').length;
            const approved = response.data.filter(l => l.status === 'approved').length;
            const rejected = response.data.filter(l => l.status === 'rejected').length;
            
            setStats({ pending, approved, rejected });
        } catch (error) {
            console.error('Error fetching leaves:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLeaveSubmit = () => {
        setShowLeaveForm(false);
        fetchLeaves();
    };

    const handleCancelLeave = async (leaveId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5000/api/leaves/${leaveId}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchLeaves();
        } catch (error) {
            console.error('Error cancelling leave:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Calendar className="w-8 h-8 text-blue-600 mr-3" />
                            <h1 className="text-xl font-semibold text-gray-900">
                                Leave Management System
                            </h1>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <User className="w-5 h-5 text-gray-500" />
                                <span className="text-gray-700">{user?.name}</span>
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                    {user?.role}
                                </span>
                            </div>
                            <button
                                onClick={logout}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Clock className="h-8 w-8 text-yellow-500" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Pending Leaves</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-8 w-8 text-green-500" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Approved Leaves</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <XCircle className="h-8 w-8 text-red-500" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Rejected Leaves</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.rejected}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Calendar className="h-8 w-8 text-blue-500" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Remaining Days</p>
                                <p className="text-2xl font-semibold text-gray-900">{user?.remainingLeaveDays || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column - Leave Form */}
                    <div className="lg:w-1/3">
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">
                                    {showLeaveForm ? 'Apply for Leave' : 'Quick Actions'}
                                </h2>
                            </div>
                            
                            <div className="p-6">
                                {showLeaveForm ? (
                                    <LeaveForm 
                                        onCancel={() => setShowLeaveForm(false)}
                                        onSubmit={handleLeaveSubmit}
                                        remainingDays={user?.remainingLeaveDays || 0}
                                    />
                                ) : (
                                    <div className="space-y-4">
                                        <button
                                            onClick={() => setShowLeaveForm(true)}
                                            className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            <Plus className="w-5 h-5 mr-2" />
                                            Apply for Leave
                                        </button>
                                        
                                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                            <h3 className="text-sm font-medium text-blue-800 mb-2">
                                                Leave Balance Info
                                            </h3>
                                            <p className="text-sm text-blue-700">
                                                You have <span className="font-bold">{user?.remainingLeaveDays || 0}</span> days remaining.
                                                Leaves are processed within 2-3 business days.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Leave History */}
                    <div className="lg:w-2/3">
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">My Leave History</h2>
                            </div>
                            
                            <div className="p-6">
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-64">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : leaves.length === 0 ? (
                                    <div className="text-center py-12">
                                        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">No leave applications yet</p>
                                        <p className="text-sm text-gray-400 mt-1">
                                            Click "Apply for Leave" to submit your first request
                                        </p>
                                    </div>
                                ) : (
                                    <LeaveList 
                                        leaves={leaves} 
                                        userRole={user?.role}
                                        onCancel={handleCancelLeave}
                                        showActions={true}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default EmployeeDashboard;