import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { Search, Bell, ChevronRight, Moon, Sun } from 'lucide-react';
import './Layout.css';

const breadcrumbMap = {
  dashboard: 'Dashboard',
  jobs: 'Jobs',
  new: 'Create New',
  candidates: 'Candidates',
  pipeline: 'Pipeline',
  interviews: 'Interviews',
  analytics: 'Analytics',
  ai: 'AI Intelligence',
  parser: 'Resume Parser',
  insights: 'AI Insights',
  search: 'Search',
  settings: 'Settings',
};

export default function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState('dark');

  const pathSegments = location.pathname.split('/').filter(Boolean);

  const breadcrumbs = pathSegments.map((seg, i) => ({
    label: breadcrumbMap[seg] || seg,
    path: '/' + pathSegments.slice(0, i + 1).join('/'),
    isLast: i === pathSegments.length - 1,
  }));

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <nav className="header-breadcrumbs" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="breadcrumb-item">
              {i > 0 && <ChevronRight size={14} className="breadcrumb-sep" />}
              {crumb.isLast ? (
                <span className="breadcrumb-current">{crumb.label}</span>
              ) : (
                <button
                  className="breadcrumb-link"
                  onClick={() => navigate(crumb.path)}
                >
                  {crumb.label}
                </button>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="header-center">
        <form className="header-search" onSubmit={handleSearch}>
          <Search size={16} className="header-search-icon" />
          <input
            id="global-search"
            type="text"
            placeholder="Search jobs, candidates, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <kbd className="header-search-kbd">⌘K</kbd>
        </form>
      </div>

      <div className="header-right">
        <button
          className="header-icon-btn"
          onClick={toggleTheme}
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="header-icon-btn header-notif-btn" title="Notifications">
          <Bell size={18} />
          <span className="header-notif-dot" />
        </button>

        <div className="header-user-pill">
          <div className="header-user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <span className="header-user-name">{user?.name?.split(' ')[0]}</span>
        </div>
      </div>
    </header>
  );
}
