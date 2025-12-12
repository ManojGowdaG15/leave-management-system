import React, { useState } from 'react';
import { 
    Users, 
    Mail, 
    Phone, 
    Calendar, 
    Filter, 
    Search,
    UserPlus,
    MoreVertical
} from 'lucide-react';

// Mock data for team members
const mockTeamMembers = [
    {
        id: 1,
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@company.com',
        role: 'Senior Developer',
        department: 'Engineering',
        leaveBalance: { casual: 8, sick: 10, earned: 12 },
        lastLeave: '2024-01-10',
        status: 'active'
    },
    {
        id: 2,
        name: 'Priya Sharma',
        email: 'priya.sharma@company.com',
        role: 'UI/UX Designer',
        department: 'Design',
        leaveBalance: { casual: 10, sick: 8, earned: 15 },
        lastLeave: '2024-01-15',
        status: 'active'
    },
    {
        id: 3,
        name: 'Amit Patel',
        email: 'amit.patel@company.com',
        role: 'QA Engineer',
        department: 'Testing',
        leaveBalance: { casual: 12, sick: 10, earned: 10 },
        lastLeave: '2024-01-05',
        status: 'on leave'
    },
    {
        id: 4,
        name: 'Sneha Reddy',
        email: 'sneha.reddy@company.com',
        role: 'Product Manager',
        department: 'Product',
        leaveBalance: { casual: 6, sick: 12, earned: 18 },
        lastLeave: '2024-01-20',
        status: 'active'
    },
    {
        id: 5,
        name: 'Vikram Singh',
        email: 'vikram.singh@company.com',
        role: 'DevOps Engineer',
        department: 'Operations',
        leaveBalance: { casual: 14, sick: 10, earned: 8 },
        lastLeave: '2024-01-12',
        status: 'active'
    },
];

const TeamMembers = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('all');
    const [teamMembers] = useState(mockTeamMembers);

    const filteredMembers = teamMembers.filter(member => {
        // Filter by search term
        if (searchTerm && !member.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
            !member.email.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }
        
        // Filter by department
        if (filterDepartment !== 'all' && member.department !== filterDepartment) {
            return false;
        }
        
        return true;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'on leave': return 'bg-yellow-100 text-yellow-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
                        <p className="text-gray-600 mt-1">
                            Manage and view details of your team members
                        </p>
                    </div>
                    <button className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Team Member
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <Filter className="h-5 w-5 text-gray-500" />
                            <select
                                value={filterDepartment}
                                onChange={(e) => setFilterDepartment(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Departments</option>
                                <option value="Engineering">Engineering</option>
                                <option value="Design">Design</option>
                                <option value="Testing">Testing</option>
                                <option value="Product">Product</option>
                                <option value="Operations">Operations</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                        Showing {filteredMembers.length} of {teamMembers.length} members
                    </div>
                </div>
            </div>

            {/* Team Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMembers.map((member) => (
                    <div key={member.id} className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        {/* Member Header */}
                        <div className="p-6 border-b">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center">
                                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                        <span className="text-blue-600 text-lg font-bold">
                                            {member.name.charAt(0)}
                                        </span>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {member.name}
                                        </h3>
                                        <p className="text-sm text-gray-600">{member.role}</p>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreVertical className="h-5 w-5" />
                                </button>
                            </div>
                            
                            <div className="mt-4">
                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(member.status)}`}>
                                    {member.status}
                                </span>
                            </div>
                        </div>

                        {/* Member Details */}
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center text-gray-600">
                                    <Mail className="h-4 w-4 mr-3" />
                                    <span className="text-sm truncate">{member.email}</span>
                                </div>
                                
                                <div className="flex items-center text-gray-600">
                                    <Users className="h-4 w-4 mr-3" />
                                    <span className="text-sm">{member.department}</span>
                                </div>
                                
                                <div className="flex items-center text-gray-600">
                                    <Calendar className="h-4 w-4 mr-3" />
                                    <span className="text-sm">
                                        Last leave: {new Date(member.lastLeave).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            {/* Leave Balance */}
                            <div className="mt-6 pt-6 border-t">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Leave Balance</h4>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-blue-600">
                                            {member.leaveBalance.casual}
                                        </div>
                                        <div className="text-xs text-gray-500">Casual</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-green-600">
                                            {member.leaveBalance.sick}
                                        </div>
                                        <div className="text-xs text-gray-500">Sick</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-purple-600">
                                            {member.leaveBalance.earned}
                                        </div>
                                        <div className="text-xs text-gray-500">Earned</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="px-6 py-4 bg-gray-50 border-t">
                            <button className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-800">
                                View Leave History
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredMembers.length === 0 && (
                <div className="text-center py-12">
                    <Users className="h-16 w-16 mx-auto text-gray-300" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No team members found</h3>
                    <p className="mt-2 text-gray-500">
                        Try adjusting your search or filter criteria
                    </p>
                </div>
            )}

            {/* Team Summary */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Team Members</p>
                            <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                            <Calendar className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">On Leave Today</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {teamMembers.filter(m => m.status === 'on leave').length}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                            <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Departments</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {[...new Set(teamMembers.map(m => m.department))].length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamMembers;