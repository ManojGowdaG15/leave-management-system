import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  CheckCircleIcon, 
  CalendarDaysIcon, 
  ExclamationTriangleIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

const LeaveBalance = ({ user }) => {
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaveBalance();
    fetchLeaveHistory();
  }, []);

  const fetchLeaveBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/leave/balance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaveBalance(response.data);
    } catch (err) {
      console.error('Leave balance error:', err.response || err);
      setError('Failed to load leave balance');
      toast.error('Failed to load leave balance');
    }
  };

  const fetchLeaveHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/leave/history', {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 20 }
      });
      
      const approvedLeaves = response.data.leaves
        .filter(leave => leave.status === 'Approved')
        .map(leave => ({
          leave_type: leave.leaveType,
          start_date: leave.startDate,
          end_date: leave.endDate,
          days: Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1
        }));
      
      setLeaveHistory(approvedLeaves);
      setLoading(false);
    } catch (err) {
      console.error('Leave history error:', err.response || err);
      setLoading(false);
    }
  };

  const leaveTypes = [
    { 
      type: 'Casual', 
      total: 12, 
      color: 'blue',
      description: 'For personal or casual purposes',
      rules: ['Minimum 1 day advance notice', 'Cannot be encashed', 'Expires yearly']
    },
    { 
      type: 'Sick', 
      total: 10, 
      color: 'yellow',
      description: 'For medical reasons or health issues',
      rules: ['Medical certificate required for 3+ days', 'Can apply on same day', 'Carry forward allowed (max 5 days)']
    },
    { 
      type: 'Earned', 
      total: 15, 
      color: 'green',
      description: 'Accumulated earned leaves',
      rules: ['Requires 7 days advance notice', 'Up to 50% can be encashed', 'Can be carried forward']
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        progress: 'bg-blue-500',
        badge: 'bg-blue-500',
        light: 'bg-blue-50'
      },
      yellow: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-600',
        progress: 'bg-yellow-500',
        badge: 'bg-yellow-500',
        light: 'bg-yellow-50'
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        progress: 'bg-green-500',
        badge: 'bg-green-500',
        light: 'bg-green-50'
      }
    };
    return colors[color] || colors.blue;
  };

  const getLeaveUsage = (leaveType) => {
    if (!leaveHistory.length) return 0;
    
    const usedDays = leaveHistory
      .filter(leave => leave.leave_type === leaveType)
      .reduce((total, leave) => total + leave.days, 0);
    
    return usedDays;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading leave balance...</p>
      </div>
    </div>
  );

  if (error && !leaveBalance) return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
      <h3 className="font-bold mb-2">Error Loading Leave Balance</h3>
      <p>{error}</p>
      <button 
        onClick={fetchLeaveBalance}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Leave Balance</h1>
        <p className="text-gray-600 mt-2">View your available leave balance and usage</p>
      </div>

      {/* Leave Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {leaveTypes.map((leaveType, index) => {
          const balance = leaveBalance?.[`${leaveType.type.toLowerCase()}Leaves`] || leaveType.total;
          const used = getLeaveUsage(leaveType.type);
          const available = balance - used;
          const percentage = (used / leaveType.total) * 100;
          const colors = getColorClasses(leaveType.color);

          return (
            <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-xl font-bold ${colors.text}`}>{leaveType.type} Leave</h3>
                  <span className={`px-3 py-1 ${colors.badge} text-white text-sm font-medium rounded-full`}>
                    {available} days left
                  </span>
                </div>
                
                {/* Description */}
                <p className="text-sm text-gray-600 mb-4">{leaveType.description}</p>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Used: {used} days</span>
                    <span className="text-sm text-gray-600">Total: {leaveType.total} days</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${colors.progress} h-2 rounded-full`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">Available: {available} days</span>
                    <span className="text-xs text-gray-500">{Math.round(percentage)}% used</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="flex items-center justify-center">
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium">Available</span>
                    </div>
                    <div className="text-lg font-bold mt-1">{available}</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="flex items-center justify-center">
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-sm font-medium">Used</span>
                    </div>
                    <div className="text-lg font-bold mt-1">{used}</div>
                  </div>
                </div>

                {/* Rules */}
                <div className={`${colors.light} rounded-lg p-3`}>
                  <h6 className="text-sm font-semibold text-gray-700 mb-2">Rules:</h6>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {leaveType.rules.map((rule, idx) => (
                      <li key={idx} className="flex items-start">
                        <ExclamationTriangleIcon className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Table */}
      <div className="mt-8 bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Leave Balance Summary</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yearly Quota</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Used</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization %</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaveTypes.map((leaveType, index) => {
                  const balance = leaveBalance?.[`${leaveType.type.toLowerCase()}Leaves`] || leaveType.total;
                  const used = getLeaveUsage(leaveType.type);
                  const available = balance - used;
                  const percentage = (used / leaveType.total) * 100;
                  const colors = getColorClasses(leaveType.color);

                  let status = 'Healthy';
                  let statusColor = 'text-green-600 bg-green-100';
                  
                  if (percentage > 80) {
                    status = 'Critical';
                    statusColor = 'text-red-600 bg-red-100';
                  } else if (percentage > 50) {
                    status = 'Moderate';
                    statusColor = 'text-yellow-600 bg-yellow-100';
                  }

                  return (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`p-2 ${colors.bg} rounded-lg mr-3`}>
                            <CalendarDaysIcon className={`h-5 w-5 ${colors.text}`} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{leaveType.type} Leave</div>
                            <div className="text-sm text-gray-500">{leaveType.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900 font-medium">{leaveType.total} days</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-yellow-600 font-medium">
                          <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                          {used} days
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-green-600 font-medium">
                          <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                          {available} days
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-grow-1 mr-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`${colors.progress} h-2 rounded-full`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="font-medium">{Math.round(percentage)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Leave History */}
      {leaveHistory.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Leave Usage</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaveHistory.slice(0, 5).map((leave, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          leave.leave_type === 'Casual' ? 'bg-blue-100 text-blue-800' :
                          leave.leave_type === 'Sick' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {leave.leave_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitesize-nowrap">
                        {leave.days} day(s)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          Approved ✓
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h5 className="font-bold text-blue-800 mb-3 flex items-center">
          <LightBulbIcon className="h-5 w-5 mr-2" />
          Leave Management Tips
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h6 className="font-medium text-blue-800 mb-2">Planning Tips:</h6>
            <ul className="text-blue-700 space-y-1 text-sm">
              <li className="flex items-start">
                <CheckCircleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                Plan leaves around project deadlines
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                Apply well in advance for better approval chances
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                Check team calendar before applying
              </li>
            </ul>
          </div>
          <div>
            <h6 className="font-medium text-blue-800 mb-2">Balance Management:</h6>
            <ul className="text-blue-700 space-y-1 text-sm">
              <li className="flex items-start">
                <ExclamationTriangleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                Casual leaves expire yearly - use them
              </li>
              <li className="flex items-start">
                <ExclamationTriangleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                Sick leaves can be carried forward (max 5 days)
              </li>
              <li className="flex items-start">
                <ExclamationTriangleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                Earned leaves can be encashed up to 50%
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveBalance;