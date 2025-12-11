import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  History, 
  Users, 
  FileText,
  Settings,
  LogOut,
  User,
  CheckSquare
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isOpen }) => {
  const { user, logout } = useAuth();

  const employeeMenu = [
    { to: '/employee', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/employee/apply-leave', icon: Calendar, label: 'Apply Leave' },
    { to: '/employee/leave-history', icon: History, label: 'Leave History' },
    { to: '/employee/leave-balance', icon: User, label: 'Leave Balance' },
  ];

  const managerMenu = [
    { to: '/manager', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/manager/pending-approvals', icon: CheckSquare, label: 'Pending Approvals' },
    { to: '/manager/team-calendar', icon: Calendar, label: 'Team Calendar' },
    { to: '/manager/team-overview', icon: Users, label: 'Team Overview' },
    { to: '/manager/expenses', icon: FileText, label: 'Expense Claims' },
  ];

  const menuItems = user?.role === 'manager' || user?.role === 'admin' 
    ? managerMenu 
    : employeeMenu;

  const navItemClasses = "flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors rounded-lg";
  const activeNavItemClasses = "flex items-center px-4 py-3 bg-primary-50 text-primary-600 border-r-2 border-primary-600 rounded-lg";

  return (
    <aside className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">LeaveManager</h2>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 
                isActive ? activeNavItemClasses : navItemClasses
              }
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
          
          <div className="pt-6 mt-6 border-t border-gray-200">
            <NavLink
              to="/settings"
              className={({ isActive }) => 
                isActive ? activeNavItemClasses : navItemClasses
              }
            >
              <Settings className="h-5 w-5 mr-3" />
              <span className="font-medium">Settings</span>
            </NavLink>
          </div>
        </nav>

        {/* User info and logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.department}</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;