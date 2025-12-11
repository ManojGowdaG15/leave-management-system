import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color, trend, subtitle }) => {
  const getColorClasses = (color) => {
    switch (color) {
      case 'blue':
        return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' };
      case 'green':
        return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' };
      case 'red':
        return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' };
      case 'yellow':
        return { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' };
      case 'purple':
        return { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };
    }
  };

  const colors = getColorClasses(color);

  return (
    <div className={`card border ${colors.border} hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <div className={`p-3 rounded-lg ${colors.bg} inline-block mb-4`}>
            <Icon className={`h-6 w-6 ${colors.text}`} />
          </div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        
        {trend && (
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            trend.direction === 'up' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${colors.bg.replace('50', '500')} rounded-full`}
            style={{ width: '75%' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;