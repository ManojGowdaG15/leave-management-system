import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  CheckCircleIcon, 
  CalendarDaysIcon, 
  ExclamationTriangleIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

const LeaveBalance = ({ user }) => {
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaveBalance();
  }, []);

  const fetchLeaveBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/leaves/balance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaveBalance(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load leave balance');
      toast.error('Failed to load leave balance');
      setLoading(false);
    }
  };

  const leaveTypes = [
    { type: 'Casual', total: 12, color: 'blue' },
    { type: 'Sick', total: 10, color: 'yellow' },
    { type: 'Earned', total: 15, color: 'green' }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        progress: 'bg-blue-500',
        badge: 'bg-blue-500'
      },
      yellow: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-600',
        progress: 'bg-yellow-500',
        badge: 'bg-yellow-500'
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        progress: 'bg-green-500',
        badge: 'bg-green-500'
      }
    };
    return colors[color] || colors.blue;
  };

  if (loading) return (
    <div className="text-center py-12">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-600">Loading leave balance...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
      {error}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Leave Balance</h1>
        <p className="text-gray-600 mt-2">View your available leave balance</p>
      </div>

      {/* Leave Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {leaveTypes.map((leaveType, index) => {
          const balance = leaveBalance?.[`${leaveType.type.toLowerCase()}_leaves`] || 0;
          const used = leaveType.total - balance;
          const percentage = (used / leaveType.total) * 100;
          const colors = getColorClasses(leaveType.color);

          return (
            <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-xl font-bold ${colors.text}`}>{leaveType.type} Leave</h3>
                  <span className={`px-3 py-1 ${colors.badge} text-white text-sm font-medium rounded-full`}>
                    {balance} days left
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Used: {used} days</span>
                    <span className="text-sm text-gray-600">Total: {leaveType.total} days</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${colors.progress} h-2 rounded-full`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-6">
                  <h6 className="text-sm font-semibold text-gray-700 mb-3">Leave Details:</h6>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                      Available: <span className="font-medium ml-1">{balance} days</span>
                    </li>
                    <li className="flex items-center">
                      <CalendarDaysIcon className="h-4 w-4 text-yellow-500 mr-2" />
                      Used: <span className="font-medium ml-1">{used} days</span>
                    </li>
                    <li className="flex items-center">
                      <CalendarDaysIcon className="h-4 w-4 text-blue-500 mr-2" />
                      Yearly quota: <span className="font-medium ml-1">{leaveType.total} days</span>
                    </li>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Entitlement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Used</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining %</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaveTypes.map((leaveType, index) => {
                  const balance = leaveBalance?.[`${leaveType.type.toLowerCase()}_leaves`] || 0;
                  const used = leaveType.total - balance;
                  const percentage = (balance / leaveType.total) * 100;
                  const colors = getColorClasses(leaveType.color);

                  return (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 ${colors.badge} text-white text-sm font-medium rounded-full mr-2`}>
                          {leaveType.type}
                        </span>
                        {leaveType.type} Leave
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{leaveType.total} days</td>
                      <td className="px-6 py-4 whitespace-nowrap text-yellow-600 font-medium">
                        <CalendarDaysIcon className="h-4 w-4 inline mr-1" />
                        {used} days
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">
                        <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                        {balance} days
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-grow-1 mr-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`${colors.progress} h-2 rounded-full`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="font-medium">{Math.round(percentage)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h5 className="font-bold text-blue-800 mb-3 flex items-center">
          <LightBulbIcon className="h-5 w-5 mr-2" />
          Leave Policy Tips
        </h5>
        <ul className="text-blue-700 space-y-2">
          <li className="flex items-start">
            <ExclamationTriangleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            Casual leaves should be applied at least 1 day in advance
          </li>
          <li className="flex items-start">
            <ExclamationTriangleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            Sick leaves require a medical certificate for more than 2 days
          </li>
          <li className="flex items-start">
            <ExclamationTriangleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            Earned leaves can be encashed at the end of the year (max 50%)
          </li>
          <li className="flex items-start">
            <ExclamationTriangleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            All leaves expire at the end of the calendar year
          </li>
        </ul>
      </div>
    </div>
  );
};

export default LeaveBalance;