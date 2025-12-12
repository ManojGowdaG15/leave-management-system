import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarPlus, 
  History, 
  PieChart,
  Users,
  UserCog,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react';
import authService from '../../services/authService';
import './Layout.css';

const MainLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const employeeNavItems = [
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/apply-leave', icon: <CalendarPlus size={20} />, label: 'Apply Leave' },
    { path: '/leave-history', icon: <History size={20} />, label: 'Leave History' },
    { path: '/leave-balance', icon: <PieChart size={20} />, label: 'Leave Balance' },
  ];

  const managerNavItems = [
    { path: '/manager/dashboard', icon: <LayoutDashboard size={20} />, label: 'Manager Dashboard' },
    { path: '/manager/team-leaves', icon: <Users size={20} />, label: 'Team Leaves' },
    { path: '/manager/team-management', icon: <UserCog size={20} />, label: 'Team Management' },
  ];

  const getNavItems = () => {
    if (user?.role === 'manager' || user?.role === 'admin') {
      return [...employeeNavItems, ...managerNavItems];
    }
    return employeeNavItems;
  };

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="user-info">
            <div className="avatar">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h3>{user?.name}</h3>
              <p className="user-role">{user?.role} • {user?.department}</p>
            </div>
          </div>
          <button 
            className="sidebar-toggle" 
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {getNavItems().map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="main-header">
          <button 
            className="menu-toggle"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="header-right">
            <div className="user-profile">
              <User size={20} />
              <span>{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;