import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  FileText, 
  Users, 
  Settings,
  BarChart3
} from 'lucide-react';

const Sidebar = ({ isOpen, user, onClose }) => {
  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Apply Leave', href: '/apply-leave', icon: Calendar },
    { name: 'Leave History', href: '/leave-history', icon: FileText },
    { name: 'Leave Balance', href: '/leave-balance', icon: BarChart3 },
    ...(user?.role === 'manager' || user?.role === 'admin' ? [
      { name: 'Team Requests', href: '/team-requests', icon: Users },
      { name: 'Team Calendar', href: '/team-calendar', icon: Calendar },
    ] : []),
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto
      flex flex-col h-full overflow-y-auto
    `}>
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">LeaveEase</h1>
            <p className="text-xs text-gray-500">Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) => `
              flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors
              ${isActive 
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' 
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }
            `}
            onClick={onClose}
          >
            <item.icon className={`h-5 w-5 mr-3 ${({ isActive }) => isActive ? 'text-blue-600' : 'text-gray-400'}`} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Leave balance quick view */}
      {user?.leave_balance && (
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Leave Balance</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Casual</span>
              <span className="text-sm font-semibold text-blue-600">{user.leave_balance.casual_leaves}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Sick</span>
              <span className="text-sm font-semibold text-green-600">{user.leave_balance.sick_leaves}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Earned</span>
              <span className="text-sm font-semibold text-purple-600">{user.leave_balance.earned_leaves}</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;