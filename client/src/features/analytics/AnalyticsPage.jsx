import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import {
  BarChart3, TrendingUp, Users, Briefcase, Award,
  Target, Clock, Star, PieChart as PieIcon, Activity
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Legend
} from 'recharts';
import './Analytics.css';

const COLORS = ['#6366f1', '#06d6a0', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const STAGE_COLORS = {
  applied: '#6366f1', screening: '#8b5cf6', interview: '#3b82f6',
  assessment: '#06b6d4', offer: '#10b981', hired: '#06d6a0', rejected: '#ef4444'
};

export default function AnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [pipeline, setPipeline] = useState([]);
  const [trends, setTrends] = useState([]);
  const [sources, setSources] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [ovRes, pipRes, trendRes, srcRes, deptRes] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.getPipeline(),
        analyticsAPI.getHiringTrends(),
        analyticsAPI.getSourceEffectiveness(),
        analyticsAPI.getDepartmentStats(),
      ]);
      setOverview(ovRes.data.overview);
      setPipeline(pipRes.data.pipeline);
      setTrends(trendRes.data.trends);
      setSources(srcRes.data.sources);
      setDepartments(deptRes.data.departments);
    } catch (err) {
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const tooltipStyle = {
    background: '#1a1a2e',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#f1f5f9',
    fontSize: '12px',
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="dashboard-loading-spinner" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  const conversionRate = overview
    ? (overview.hired && overview.totalApplications
      ? ((overview.hired / overview.totalApplications) * 100).toFixed(1)
      : '0')
    : '0';

  const scoreDistribution = pipeline.filter(p => p.stage !== 'rejected').map(p => ({
    name: p.label,
    value: p.count,
    fill: STAGE_COLORS[p.stage],
  }));

  return (
    <div className="analytics page-enter">
      <div className="analytics-header">
        <div className="analytics-title">
          <BarChart3 size={22} />
          <h1>Recruitment Analytics</h1>
        </div>
        <div className="analytics-period">
          <span className="period-badge">Last 6 months</span>
        </div>
      </div>

      {/* KPI Summary Row */}
      <div className="analytics-kpis">
        <div className="analytics-kpi">
          <div className="analytics-kpi-icon kpi-bg-primary"><Briefcase size={18} /></div>
          <div className="analytics-kpi-data">
            <span className="analytics-kpi-value">{overview?.activeJobs || 0}</span>
            <span className="analytics-kpi-label">Active Jobs</span>
          </div>
        </div>
        <div className="analytics-kpi">
          <div className="analytics-kpi-icon kpi-bg-accent"><Users size={18} /></div>
          <div className="analytics-kpi-data">
            <span className="analytics-kpi-value">{overview?.totalCandidates || 0}</span>
            <span className="analytics-kpi-label">Total Candidates</span>
          </div>
        </div>
        <div className="analytics-kpi">
          <div className="analytics-kpi-icon kpi-bg-success"><Award size={18} /></div>
          <div className="analytics-kpi-data">
            <span className="analytics-kpi-value">{overview?.hired || 0}</span>
            <span className="analytics-kpi-label">Hired</span>
          </div>
        </div>
        <div className="analytics-kpi">
          <div className="analytics-kpi-icon kpi-bg-info"><Target size={18} /></div>
          <div className="analytics-kpi-data">
            <span className="analytics-kpi-value">{overview?.avgAiScore || 0}%</span>
            <span className="analytics-kpi-label">Avg AI Score</span>
          </div>
        </div>
        <div className="analytics-kpi">
          <div className="analytics-kpi-icon kpi-bg-warning"><TrendingUp size={18} /></div>
          <div className="analytics-kpi-data">
            <span className="analytics-kpi-value">{conversionRate}%</span>
            <span className="analytics-kpi-label">Conversion Rate</span>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="analytics-charts-row">
        {/* Application Trends */}
        <div className="analytics-chart-card analytics-chart-wide">
          <div className="analytics-chart-header">
            <h3><TrendingUp size={16} /> Application Trends</h3>
          </div>
          <div className="analytics-chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="aGradApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="aGradHired" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06d6a0" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06d6a0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="applications" stroke="#6366f1" fillOpacity={1} fill="url(#aGradApps)" strokeWidth={2} name="Applications" />
                <Area type="monotone" dataKey="hired" stroke="#06d6a0" fillOpacity={1} fill="url(#aGradHired)" strokeWidth={2} name="Hired" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Funnel */}
        <div className="analytics-chart-card">
          <div className="analytics-chart-header">
            <h3><Activity size={16} /> Pipeline Funnel</h3>
          </div>
          <div className="analytics-chart-body">
            <div className="funnel-stages">
              {pipeline.map((stage, idx) => {
                const maxCount = Math.max(...pipeline.map(p => p.count), 1);
                const width = Math.max(20, (stage.count / maxCount) * 100);
                return (
                  <div key={idx} className="funnel-stage">
                    <div className="funnel-label">
                      <span className="funnel-dot" style={{ background: STAGE_COLORS[stage.stage] }} />
                      <span>{stage.label}</span>
                    </div>
                    <div className="funnel-bar-wrap">
                      <div
                        className="funnel-bar"
                        style={{ width: `${width}%`, background: STAGE_COLORS[stage.stage] }}
                      />
                    </div>
                    <div className="funnel-stats">
                      <span className="funnel-count">{stage.count}</span>
                      <span className="funnel-pct">{stage.percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Charts Row */}
      <div className="analytics-charts-row analytics-charts-triple">
        {/* Source Effectiveness */}
        <div className="analytics-chart-card">
          <div className="analytics-chart-header">
            <h3><PieIcon size={16} /> Source Distribution</h3>
          </div>
          <div className="analytics-chart-body analytics-chart-body-center">
            <ResponsiveContainer width="100%" height={220}>
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
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="source-legend">
              {sources.map((src, idx) => (
                <div key={idx} className="source-legend-item">
                  <span className="source-legend-dot" style={{ background: COLORS[idx % COLORS.length] }} />
                  <span className="source-legend-name">{src.source}</span>
                  <span className="source-legend-value">{src.candidates}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Department Stats */}
        <div className="analytics-chart-card">
          <div className="analytics-chart-header">
            <h3><Briefcase size={16} /> Department Stats</h3>
          </div>
          <div className="analytics-chart-body">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={departments.slice(0, 6)} layout="vertical" barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="_id" type="category" stroke="#64748b" fontSize={11} width={100} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="jobs" fill="#6366f1" radius={[0, 6, 6, 0]} name="Jobs" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source Conversion Rates */}
        <div className="analytics-chart-card">
          <div className="analytics-chart-header">
            <h3><Star size={16} /> Source Conversion</h3>
          </div>
          <div className="analytics-chart-body">
            <div className="conversion-list">
              {sources.map((src, idx) => (
                <div key={idx} className="conversion-item">
                  <div className="conversion-info">
                    <span className="conversion-source">{src.source}</span>
                    <span className="conversion-stats">
                      {src.hired} hired / {src.applications} applied
                    </span>
                  </div>
                  <div className="conversion-bar-wrap">
                    <div
                      className="conversion-bar"
                      style={{
                        width: `${src.conversionRate}%`,
                        background: COLORS[idx % COLORS.length]
                      }}
                    />
                  </div>
                  <span className="conversion-rate">{src.conversionRate}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
