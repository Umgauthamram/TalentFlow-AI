import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { analyticsAPI } from '../../services/api';
import {
  Briefcase, Users, FileCheck, Calendar, TrendingUp,
  Clock, Star, Award, ArrowUpRight, ArrowDownRight,
  UserCheck, Target, Zap, BarChart3
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [pipeline, setPipeline] = useState([]);
  const [trends, setTrends] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [ovRes, pipRes, trendRes, srcRes] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.getPipeline(),
        analyticsAPI.getHiringTrends(),
        analyticsAPI.getSourceEffectiveness()
      ]);
      setOverview(ovRes.data.overview);
      setPipeline(pipRes.data.pipeline);
      setTrends(trendRes.data.trends);
      setSources(srcRes.data.sources);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = overview ? [
    { label: 'Active Jobs', value: overview.activeJobs, total: overview.totalJobs, icon: Briefcase, color: 'primary', trend: '+3', up: true },
    { label: 'Total Candidates', value: overview.totalCandidates, icon: Users, color: 'accent', trend: '+12', up: true },
    { label: 'Applications', value: overview.totalApplications, subtitle: `${overview.recentApplications} this month`, icon: FileCheck, color: 'info', trend: '+8', up: true },
    { label: 'Interviews', value: overview.upcomingInterviews, subtitle: 'Upcoming', icon: Calendar, color: 'warning', trend: '+2', up: true },
    { label: 'Shortlisted', value: overview.shortlisted, icon: Star, color: 'accent', trend: '+5', up: true },
    { label: 'Hired', value: overview.hired, icon: Award, color: 'success', trend: '+1', up: true },
    { label: 'Avg AI Score', value: overview.avgAiScore, subtitle: 'Out of 100', icon: Target, color: 'primary', trend: '+4', up: true },
    { label: 'Team Members', value: overview.totalUsers, icon: UserCheck, color: 'info' },
  ] : [];

  const stageColors = {
    applied: '#6366f1',
    screening: '#8b5cf6',
    interview: '#3b82f6',
    assessment: '#06b6d4',
    offer: '#10b981',
    hired: '#06d6a0',
    rejected: '#ef4444'
  };

  const pieColors = ['#6366f1', '#06d6a0', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard page-enter">
      {/* Welcome Banner */}
      <div className="dashboard-welcome">
        <div className="dashboard-welcome-content">
          <h2>Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
          <p>Here's an overview of your hiring pipeline and recruitment metrics.</p>
        </div>
        <div className="dashboard-welcome-actions">
          <button className="btn-primary" onClick={() => navigate('/jobs/new')}>
            <Zap size={16} /> Post New Job
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid stagger-children">
        {kpiCards.map((kpi, i) => (
          <div key={i} className={`kpi-card kpi-${kpi.color}`}>
            <div className="kpi-icon">
              <kpi.icon size={20} />
            </div>
            <div className="kpi-data">
              <span className="kpi-value">{kpi.value}</span>
              <span className="kpi-label">{kpi.label}</span>
              {kpi.subtitle && <span className="kpi-subtitle">{kpi.subtitle}</span>}
            </div>
            {kpi.trend && (
              <div className={`kpi-trend ${kpi.up ? 'kpi-trend-up' : 'kpi-trend-down'}`}>
                {kpi.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {kpi.trend}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="dashboard-charts">
        {/* Pipeline Funnel */}
        <div className="chart-card">
          <div className="chart-header">
            <h3><BarChart3 size={18} /> Hiring Pipeline</h3>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={pipeline.filter(p => p.stage !== 'rejected')} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {pipeline.filter(p => p.stage !== 'rejected').map((entry, idx) => (
                    <Cell key={idx} fill={stageColors[entry.stage] || '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application Trends */}
        <div className="chart-card">
          <div className="chart-header">
            <h3><TrendingUp size={18} /> Application Trends</h3>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="gradApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradHired" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06d6a0" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06d6a0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9' }} />
                <Area type="monotone" dataKey="applications" stroke="#6366f1" fillOpacity={1} fill="url(#gradApps)" strokeWidth={2} />
                <Area type="monotone" dataKey="hired" stroke="#06d6a0" fillOpacity={1} fill="url(#gradHired)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="dashboard-bottom">
        {/* Source Distribution */}
        <div className="chart-card chart-card-sm">
          <div className="chart-header">
            <h3>Candidate Sources</h3>
          </div>
          <div className="chart-body chart-body-pie">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={sources}
                  dataKey="candidates"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={3}
                >
                  {sources.map((_, idx) => (
                    <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {sources.map((src, idx) => (
                <div key={idx} className="pie-legend-item">
                  <span className="pie-legend-dot" style={{ background: pieColors[idx % pieColors.length] }} />
                  <span className="pie-legend-label">{src.source}</span>
                  <span className="pie-legend-value">{src.candidates}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pipeline Stats */}
        <div className="chart-card chart-card-sm">
          <div className="chart-header">
            <h3>Pipeline Overview</h3>
          </div>
          <div className="chart-body">
            <div className="pipeline-stages">
              {pipeline.map((stage, idx) => (
                <div key={idx} className="pipeline-stage-row">
                  <div className="pipeline-stage-info">
                    <span className="pipeline-stage-dot" style={{ background: stageColors[stage.stage] }} />
                    <span className="pipeline-stage-name">{stage.label}</span>
                  </div>
                  <div className="pipeline-stage-bar-wrap">
                    <div
                      className="pipeline-stage-bar"
                      style={{
                        width: `${stage.percentage}%`,
                        background: stageColors[stage.stage]
                      }}
                    />
                  </div>
                  <span className="pipeline-stage-count">{stage.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="chart-card chart-card-sm">
          <div className="chart-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="chart-body">
            <div className="quick-actions">
              <button className="quick-action-btn" onClick={() => navigate('/jobs/new')}>
                <Briefcase size={18} />
                <span>Create Job</span>
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/candidates')}>
                <Users size={18} />
                <span>View Candidates</span>
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/pipeline')}>
                <Clock size={18} />
                <span>Pipeline Board</span>
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/analytics')}>
                <BarChart3 size={18} />
                <span>Full Analytics</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
