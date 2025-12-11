import React from 'react';
import { Calendar, Heart, Coffee, TrendingUp } from 'lucide-react';

const LeaveBalance = ({ balance }) => {
  const leaveTypes = [
    {
      type: 'casual',
      name: 'Casual Leave',
      icon: <Coffee className="w-6 h-6" />,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      type: 'sick',
      name: 'Sick Leave',
      icon: <Heart className="w-6 h-6" />,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700'
    },
    {
      type: 'earned',
      name: 'Earned Leave',
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {leaveTypes.map((leave) => (
        <div key={leave.type} className="card hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <div className={`p-3 rounded-lg ${leave.bgColor} inline-block mb-4`}>
                <div className={leave.textColor}>{leave.icon}</div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{leave.name}</h3>
              <p className="text-3xl font-bold mt-2 text-gray-900">
                {balance?.[leave.type] || 0}
                <span className="text-sm font-normal text-gray-500 ml-2">days</span>
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full ${leave.color} opacity-10`}></div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center text-sm text-gray-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              <span>Available for use</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeaveBalance;