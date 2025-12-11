import React, { useState, useEffect } from 'react';
import { Users, Calendar, CheckCircle, XCircle, TrendingUp, Download, Filter } from 'lucide-react';
import { managerAPI } from '../../services/api';
import Loader from '../common/Loader';
import { toast } from 'react-hot-toast';

const TeamOverview = () => {
  const [loading, setLoading] = useState(true);
  const [teamData, setTeamData] = useState({ stats: {}, employees: [] });
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    fetchTeamOverview();
  }, []);

  const fetchTeamOverview = async () => {
    try {
      const response = await managerAPI.getTeamOverview();
      setTeamData(response.data.data);
    } catch (error) {
      toast.error('Failed to load team overview');
    } finally {
      setLoading(false);
    }
  };

  const getDepartments = () => {
    const departments = teamData.employees?.map(emp => emp.department) || [];
    return ['all', ...new Set(departments)];
  };

  const filteredEmployees = teamData.employees?.filter(emp => 
    filterDepartment === 'all' || emp.department === filterDepartment
  ) || [];

  const calculateStats = () => {
    const employees = filteredEmployees;
    
    const totalEmployees = employees.length;
    const onLeaveToday = employees.filter(emp => {
      // This would require actual leave data - for demo, using random
      return Math.random() > 0.8;
    }).length;
    
    const avgLeaveBalance = employees.length > 0
      ? employees.reduce((sum, emp) => 
          sum + (emp.leaveBalance?.casual + emp.leaveBalance?.sick + emp.leaveBalance?.earned), 0
        ) / employees.length
      : 0;
    
    return {
      totalEmployees,
      onLeaveToday,
      avgLeaveBalance: avgLeaveBalance.toFixed(1),
      approvalRate: '92%', // Placeholder
    };
  };

  const stats = calculateStats();

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Overview</h1>
          <p className="text-gray-600">Manage and monitor your team's leave activities</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center btn-secondary">
            <Download className="h-5 w-5 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4 inline mr-1" />
              Department
            </label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="input"
            >
              {getDepartments().map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Time Range
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="input"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Actions
            </label>
            <button
              onClick={fetchTeamOverview}
              className="w-full btn-primary"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Team Members</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg mr-4">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">On Leave Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.onLeaveToday}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Leave Balance</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgLeaveBalance} days</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Approval Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approvalRate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Team Members</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leave Balance
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <Users className="h-4 w-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{employee.name}</p>
                        <p className="text-sm text-gray-500">{employee.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                      {employee.department}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Casual</span>
                        <span className="text-sm font-medium">{employee.leaveBalance?.casual || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Sick</span>
                        <span className="text-sm font-medium">{employee.leaveBalance?.sick || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Earned</span>
                        <span className="text-sm font-medium">{employee.leaveBalance?.earned || 0}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge-success">
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredEmployees.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No team members found</p>
          </div>
        )}
      </div>

      {/* Leave Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Distribution */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Leave Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Casual Leave</span>
                <span className="text-sm font-medium">45%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Sick Leave</span>
                <span className="text-sm font-medium">30%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Earned Leave</span>
                <span className="text-sm font-medium">25%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Approval Statistics */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Approval Statistics</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-600">Approved</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">85</p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-sm text-gray-600">Rejected</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">12</p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">8</p>
                <p className="text-xs text-gray-500">Awaiting review</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamOverview;