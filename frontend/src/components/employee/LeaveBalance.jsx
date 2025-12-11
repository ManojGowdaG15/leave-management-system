import React, { useState, useEffect } from 'react';
import { Coffee, Heart, Award, TrendingUp, Calendar, Download } from 'lucide-react';
import { employeeAPI } from '../../services/api';
import Loader from '../common/Loader';
import { toast } from 'react-hot-toast';

const LeaveBalance = () => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [balanceRes, leavesRes] = await Promise.all([
        employeeAPI.getLeaveBalance(),
        employeeAPI.getLeaveHistory(),
      ]);
      
      setBalance(balanceRes.data.data);
      setLeaves(leavesRes.data.data);
    } catch (error) {
      toast.error('Failed to load leave data');
    } finally {
      setLoading(false);
    }
  };

  const calculateUsage = (leaveType) => {
    if (!leaves || !balance) return 0;
    
    const totalTaken = leaves
      .filter(leave => leave.leaveType === leaveType && leave.status === 'approved')
      .reduce((sum, leave) => sum + leave.daysCount, 0);
    
    const totalAllocated = balance[leaveType] || 0;
    const totalAvailable = totalAllocated - totalTaken;
    
    return {
      taken: totalTaken,
      available: totalAvailable,
      allocated: totalAllocated,
      percentage: totalAllocated > 0 ? Math.round((totalTaken / totalAllocated) * 100) : 0,
    };
  };

  const leaveTypes = [
    {
      type: 'casual',
      name: 'Casual Leave',
      icon: Coffee,
      color: 'blue',
      description: 'For personal work or casual purposes',
    },
    {
      type: 'sick',
      name: 'Sick Leave',
      icon: Heart,
      color: 'red',
      description: 'For medical reasons or health issues',
    },
    {
      type: 'earned',
      name: 'Earned Leave',
      icon: Award,
      color: 'green',
      description: 'Accrued leaves based on service period',
    },
  ];

  const getColorClasses = (color) => {
    switch (color) {
      case 'blue': return { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-700' };
      case 'red': return { bg: 'bg-red-500', light: 'bg-red-50', text: 'text-red-700' };
      case 'green': return { bg: 'bg-green-500', light: 'bg-green-50', text: 'text-green-700' };
      default: return { bg: 'bg-gray-500', light: 'bg-gray-50', text: 'text-gray-700' };
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Balance</h1>
          <p className="text-gray-600">Track your available leaves and usage</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center btn-secondary">
            <Calendar className="h-5 w-5 mr-2" />
            View Calendar
          </button>
          <button className="flex items-center btn-primary">
            <Download className="h-5 w-5 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Annual Leave Summary</h2>
            <p className="text-primary-100 mt-1">Fiscal Year {new Date().getFullYear()}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">
              {leaveTypes.reduce((total, type) => total + calculateUsage(type.type).available, 0)} days
            </p>
            <p className="text-primary-100">Total Available</p>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-3 gap-4">
          {leaveTypes.map((type) => {
            const usage = calculateUsage(type.type);
            const colors = getColorClasses(type.color);
            
            return (
              <div key={type.type} className="text-center">
                <p className="text-sm text-primary-200">{type.name}</p>
                <p className="text-2xl font-bold mt-1">{usage.available} days</p>
                <div className="mt-2 h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${colors.bg} rounded-full`}
                    style={{ width: `${usage.percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {leaveTypes.map((type) => {
          const usage = calculateUsage(type.type);
          const colors = getColorClasses(type.color);
          
          return (
            <div key={type.type} className="card">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-lg ${colors.light}`}>
                  <type.icon className={`h-6 w-6 ${colors.text}`} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{usage.available}</p>
                  <p className="text-sm text-gray-600">days left</p>
                </div>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">{type.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{type.description}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Allocated</span>
                  <span className="font-medium">{usage.allocated} days</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Taken</span>
                  <span className="font-medium">{usage.taken} days</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Available</span>
                  <span className="font-medium text-primary-600">{usage.available} days</span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Usage</span>
                  <span className="text-sm font-medium">{usage.percentage}%</span>
                </div>
                <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${colors.bg} rounded-full`}
                    style={{ width: `${usage.percentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mt-6 flex items-center text-sm text-gray-600">
                <TrendingUp className="h-4 w-4 mr-2" />
                <span>
                  {usage.available > 0 
                    ? `You have ${usage.available} days available for use`
                    : 'No available days left'
                  }
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Usage History */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Leave Usage</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied On
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaves.slice(0, 5).map((leave) => (
                <tr key={leave._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                      leave.leaveType === 'casual' ? 'bg-blue-100 text-blue-800' :
                      leave.leaveType === 'sick' ? 'bg-red-100 text-red-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {leave.leaveType}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {leave.daysCount} days
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`badge ${
                      leave.status === 'approved' ? 'badge-success' :
                      leave.status === 'pending' ? 'badge-warning' :
                      leave.status === 'rejected' ? 'badge-danger' :
                      'badge-info'
                    }`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {new Date(leave.appliedDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {leaves.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No leave history available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveBalance;