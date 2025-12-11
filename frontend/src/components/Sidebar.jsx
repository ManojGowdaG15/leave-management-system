import React from 'react';
import { NavLink } from 'react-router-dom';
import { XMarkIcon, HomeIcon, CalendarIcon, DocumentTextIcon, UserGroupIcon, CalendarDaysIcon, UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, user, onClose, onLogout }) => {
  const employeeMenu = [
    { name: 'Dashboard', to: '/', icon: HomeIcon },
    { name: 'Apply Leave', to: '/apply-leave', icon: DocumentTextIcon },
    { name: 'Leave History', to: '/leave-history', icon: CalendarIcon },
    { name: 'Leave Balance', to: '/leave-balance', icon: CalendarDaysIcon },
    { name: 'Profile', to: '/profile', icon: UserIcon },
  ];

  const managerMenu = [
    { name: 'Dashboard', to: '/', icon: HomeIcon },
    { name: 'Team Requests', to: '/team-requests', icon: UserGroupIcon },
    { name: 'Team Calendar', to: '/team-calendar', icon: CalendarDaysIcon },
    { name: 'Apply Leave', to: '/apply-leave', icon: DocumentTextIcon },
    { name: 'Leave History', to: '/leave-history', icon: CalendarIcon },
    { name: 'Leave Balance', to: '/leave-balance', icon: CalendarDaysIcon },
    { name: 'Profile', to: '/profile', icon: UserIcon },
  ];

  const menuItems = user?.role === 'manager' ? managerMenu : employeeMenu;

  return (
    <>
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <CalendarIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Leave System</h1>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{user?.name}</h3>
                <p className="text-sm text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={onLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;