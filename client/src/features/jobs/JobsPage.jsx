import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsAPI } from '../../services/api';
import { Plus, Briefcase, MapPin, Clock, DollarSign, Users, Search, Filter, MoreVertical } from 'lucide-react';
import './Jobs.css';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => { loadJobs(); }, [search, statusFilter]);

  const loadJobs = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await jobsAPI.getAll(params);
      setJobs(data.jobs);
    } catch (err) {
      console.error('Load jobs error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status) => {
    const colors = { active: 'status-active', paused: 'status-paused', closed: 'status-closed', draft: 'status-draft' };
    return <span className={`job-status-badge ${colors[status] || ''}`}>{status}</span>;
  };

  const priorityDot = (priority) => {
    const colors = { urgent: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#64748b' };
    return <span className="priority-dot" style={{ background: colors[priority] }} title={priority} />;
  };

  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return 'Not specified';
    const fmt = (n) => n >= 1000 ? `${Math.round(n/1000)}K` : n;
    return `$${fmt(salary.min)} — $${fmt(salary.max)}`;
  };

  return (
    <div className="jobs-page page-enter">
      <div className="jobs-toolbar">
        <div className="jobs-toolbar-left">
          <div className="toolbar-search">
            <Search size={16} />
            <input placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="toolbar-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="closed">Closed</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <button className="btn-primary" onClick={() => navigate('/jobs/new')}>
          <Plus size={16} /> Create Job
        </button>
      </div>

      {loading ? (
        <div className="jobs-grid">{[1,2,3,4,5,6].map(i => <div key={i} className="job-card-skeleton skeleton" />)}</div>
      ) : jobs.length === 0 ? (
        <div className="empty-state">
          <Briefcase size={48} />
          <h3>No jobs found</h3>
          <p>Create your first job posting to start attracting candidates.</p>
          <button className="btn-primary" onClick={() => navigate('/jobs/new')}><Plus size={16} /> Create Job</button>
        </div>
      ) : (
        <div className="jobs-grid stagger-children">
          {jobs.map(job => (
            <div key={job._id} className="job-card glass-card" onClick={() => navigate(`/jobs/${job._id}`)}>
              <div className="job-card-header">
                <div className="job-card-title-row">
                  {priorityDot(job.priority)}
                  <h3 className="job-card-title">{job.title}</h3>
                </div>
                {statusBadge(job.status)}
              </div>
              <p className="job-card-dept">{job.department}</p>
              <div className="job-card-meta">
                <span><MapPin size={14} /> {job.location}</span>
                <span><Clock size={14} /> {job.type}</span>
              </div>
              <div className="job-card-meta">
                <span><DollarSign size={14} /> {formatSalary(job.salary)}</span>
                <span><Users size={14} /> {job.applicantCount} applicants</span>
              </div>
              <div className="job-card-skills">
                {(job.skills || []).slice(0, 4).map((skill, i) => (
                  <span key={i} className="skill-tag">{skill}</span>
                ))}
                {(job.skills || []).length > 4 && <span className="skill-tag skill-tag-more">+{job.skills.length - 4}</span>}
              </div>
              <div className="job-card-footer">
                <span className="job-card-date">{new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                <span className="job-card-exp">{job.experience}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
