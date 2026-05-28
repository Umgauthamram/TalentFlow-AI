import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import {
  LayoutDashboard, Briefcase, Users, GitBranch, Calendar,
  BarChart3, Brain, Search, FileText, Sparkles, LogOut,
  ChevronLeft, ChevronRight, Settings, Cpu
} from 'lucide-react';
import './Layout.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/jobs', label: 'Jobs', icon: Briefcase },
  { path: '/candidates', label: 'Candidates', icon: Users },
  { path: '/pipeline', label: 'Pipeline', icon: GitBranch },
  { path: '/interviews', label: 'Interviews', icon: Calendar },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { divider: true, label: 'AI Intelligence' },
  { path: '/ai/parser', label: 'Resume Parser', icon: FileText },
  { path: '/ai/insights', label: 'AI Insights', icon: Cpu },
  { path: '/search', label: 'Search', icon: Search },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleBadge = {
    admin: { label: 'Admin', className: 'role-admin' },
    recruiter: { label: 'Recruiter', className: 'role-recruiter' },
    hiring_manager: { label: 'Manager', className: 'role-manager' },
  };

  const currentRole = roleBadge[user?.role] || roleBadge.recruiter;

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Sparkles size={22} />
        </div>
        {!collapsed && (
          <div className="sidebar-logo-text">
            <span className="sidebar-brand">TalentFlow</span>
            <span className="sidebar-brand-ai">AI</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item, i) => {
          if (item.divider) {
            return !collapsed ? (
              <div key={i} className="sidebar-divider">
                <span>{item.label}</span>
              </div>
            ) : (
              <div key={i} className="sidebar-divider-dot" />
            );
          }
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon size={19} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name}</span>
              <span className={`sidebar-role-badge ${currentRole.className}`}>
                {currentRole.label}
              </span>
            </div>
          )}
        </div>
        <button
          className="sidebar-logout"
          onClick={handleLogout}
          title="Sign out"
        >
          <LogOut size={17} />
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        className="sidebar-toggle"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
