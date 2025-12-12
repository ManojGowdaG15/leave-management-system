import React, { useState } from 'react';
import { Calendar, Users, Filter, Download } from 'lucide-react';

const TeamCalendar = ({ calendar = [] }) => {
    const [filterType, setFilterType] = useState('all');

    const filteredLeaves = calendar.filter(leave => {
        if (filterType === 'all') return true;
        return leave.leaveType === filterType;
    });

    const getLeaveTypeColor = (type) => {
        switch (type) {
            case 'casual': return 'bg-blue-100 text-blue-800';
            case 'sick': return 'bg-green-100 text-green-800';
            case 'earned': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Group leaves by month
    const leavesByMonth = filteredLeaves.reduce((acc, leave) => {
        const month = new Date(leave.startDate).toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!acc[month]) {
            acc[month] = [];
        }
        acc[month].push(leave);
        return acc;
    }, {});

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Team Leave Calendar</h2>
                        <p className="text-gray-600 mt-1">
                            View and track approved leaves for your team members
                        </p>
                    </div>
                    <div className="flex items-center space-x-4 mt-4 md:mt-0">
                        <div className="flex items-center space-x-2">
                            <Filter className="h-5 w-5 text-gray-500" />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Leave Types</option>
                                <option value="casual">Casual Leaves</option>
                                <option value="sick">Sick Leaves</option>
                                <option value="earned">Earned Leaves</option>
                            </select>
                        </div>
                        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                            <Download className="h-4 w-4 mr-2" />
                            Export Calendar
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                            <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Leaves</p>
                            <p className="text-2xl font-bold text-gray-900">{filteredLeaves.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                            <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">This Month</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {filteredLeaves.filter(leave => {
                                    const now = new Date();
                                    const leaveDate = new Date(leave.startDate);
                                    return leaveDate.getMonth() === now.getMonth() && 
                                           leaveDate.getFullYear() === now.getFullYear();
                                }).length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                            <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Casual Leaves</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {filteredLeaves.filter(leave => leave.leaveType === 'casual').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                            <Calendar className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Unique Employees</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {[...new Set(filteredLeaves.map(leave => leave.user?._id))].length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar View */}
            {Object.keys(leavesByMonth).length > 0 ? (
                <div className="space-y-8">
                    {Object.entries(leavesByMonth).map(([month, leaves]) => (
                        <div key={month} className="bg-white rounded-xl shadow">
                            <div className="px-6 py-4 border-b">
                                <h3 className="text-lg font-semibold text-gray-900">{month}</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Employee
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Leave Dates
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Duration
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Reason
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {leaves.map((leave) => (
                                            <tr key={leave._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <span className="text-blue-600 text-sm font-medium">
                                                                {leave.user?.name?.charAt(0) || 'E'}
                                                            </span>
                                                        </div>
                                                        <div className="ml-3">
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {leave.user?.name || 'Employee'}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {leave.user?.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {new Date(leave.startDate).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-xs text-gray-500">to</div>
                                                    <div className="text-sm text-gray-900">
                                                        {new Date(leave.endDate).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getLeaveTypeColor(leave.leaveType)}`}>
                                                        {leave.leaveType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {leave.daysCount || 1} day(s)
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    <div className="max-w-xs truncate" title={leave.reason}>
                                                        {leave.reason}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow p-12 text-center">
                    <Calendar className="h-16 w-16 mx-auto text-gray-300" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No leaves scheduled</h3>
                    <p className="mt-2 text-gray-500">
                        {filterType === 'all' 
                            ? 'No approved leaves found for your team' 
                            : `No ${filterType} leaves found`}
                    </p>
                    {filterType !== 'all' && (
                        <button
                            onClick={() => setFilterType('all')}
                            className="mt-4 text-blue-600 hover:text-blue-800"
                        >
                            View all leaves →
                        </button>
                    )}
                </div>
            )}

            {/* Legend */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Leave Type Legend</h4>
                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                        <span className="text-xs text-gray-600">Casual Leave</span>
                    </div>
                    <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-xs text-gray-600">Sick Leave</span>
                    </div>
                    <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-purple-500 mr-2"></div>
                        <span className="text-xs text-gray-600">Earned Leave</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamCalendar;