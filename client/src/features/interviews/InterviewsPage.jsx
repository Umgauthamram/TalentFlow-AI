import { useState, useEffect } from 'react';
import { interviewsAPI, jobsAPI, candidatesAPI } from '../../services/api';
import {
  Calendar, Clock, Video, Phone, MapPin, Users as UsersIcon,
  Plus, Edit3, Trash2, CheckCircle, XCircle, AlertCircle,
  ChevronLeft, ChevronRight, ExternalLink, Filter
} from 'lucide-react';
import './Interviews.css';

const INTERVIEW_TYPES = [
  { key: 'phone', label: 'Phone', icon: Phone },
  { key: 'video', label: 'Video', icon: Video },
  { key: 'onsite', label: 'On-Site', icon: MapPin },
  { key: 'technical', label: 'Technical', icon: AlertCircle },
  { key: 'panel', label: 'Panel', icon: UsersIcon },
  { key: 'hr', label: 'HR', icon: UsersIcon },
];

const STATUS_COLORS = {
  scheduled: '#3b82f6',
  confirmed: '#10b981',
  in_progress: '#f59e0b',
  completed: '#06d6a0',
  cancelled: '#ef4444',
  rescheduled: '#8b5cf6',
  no_show: '#64748b',
};

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('upcoming');
  const [form, setForm] = useState({
    candidate: '', job: '', application: '',
    scheduledAt: '', duration: 60, type: 'video',
    meetingLink: '', location: '', interviewerNames: [''],
  });
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    loadInterviews();
  }, [filter]);

  const loadInterviews = async () => {
    try {
      const params = {};
      if (filter === 'upcoming') {
        params.startDate = new Date().toISOString();
        params.status = 'scheduled';
      }
      const { data } = await interviewsAPI.getAll(params);
      setInterviews(data.interviews || []);
    } catch (err) {
      console.error('Interview load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = async () => {
    try {
      const [jobRes, candRes] = await Promise.all([
        jobsAPI.getAll({ status: 'active' }),
        candidatesAPI.getAll({ limit: 100 }),
      ]);
      setJobs(jobRes.data.jobs || []);
      setCandidates(candRes.data.candidates || []);
    } catch (err) {
      console.error('Error loading data:', err);
    }
    setShowModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        interviewerNames: form.interviewerNames.filter(n => n.trim()),
      };
      await interviewsAPI.create(payload);
      setShowModal(false);
      setForm({
        candidate: '', job: '', application: '',
        scheduledAt: '', duration: 60, type: 'video',
        meetingLink: '', location: '', interviewerNames: [''],
      });
      loadInterviews();
    } catch (err) {
      console.error('Create interview error:', err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await interviewsAPI.update(id, { status });
      setInterviews(prev =>
        prev.map(i => i._id === id ? { ...i, status } : i)
      );
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const deleteInterview = async (id) => {
    if (!confirm('Cancel this interview?')) return;
    try {
      await interviewsAPI.delete(id);
      setInterviews(prev => prev.filter(i => i._id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric'
    });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getTypeIcon = (type) => {
    const found = INTERVIEW_TYPES.find(t => t.key === type);
    return found ? found.icon : Calendar;
  };

  if (loading) {
    return (
      <div className="interviews-loading">
        <div className="dashboard-loading-spinner" />
        <p>Loading interviews...</p>
      </div>
    );
  }

  return (
    <div className="interviews page-enter">
      <div className="interviews-header">
        <div className="interviews-title">
          <Calendar size={22} />
          <h1>Interviews</h1>
          <span className="interviews-count">{interviews.length} scheduled</span>
        </div>
        <div className="interviews-actions">
          <div className="interviews-filter-tabs">
            {['upcoming', 'all'].map(f => (
              <button
                key={f}
                className={`filter-tab ${filter === f ? 'filter-tab-active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn-primary" onClick={openCreateModal}>
            <Plus size={16} /> Schedule Interview
          </button>
        </div>
      </div>

      <div className="interviews-list">
        {interviews.length === 0 ? (
          <div className="interviews-empty">
            <Calendar size={40} />
            <h3>No interviews scheduled</h3>
            <p>Schedule a new interview to get started.</p>
            <button className="btn-primary" onClick={openCreateModal}>
              <Plus size={16} /> Schedule Interview
            </button>
          </div>
        ) : (
          interviews.map(interview => {
            const TypeIcon = getTypeIcon(interview.type);
            return (
              <div key={interview._id} className="interview-card">
                <div className="interview-date-block">
                  <span className="interview-date">{formatDate(interview.scheduledAt)}</span>
                  <span className="interview-time">
                    <Clock size={12} /> {formatTime(interview.scheduledAt)}
                  </span>
                  <span className="interview-duration">{interview.duration} min</span>
                </div>

                <div className="interview-info">
                  <div className="interview-candidate">
                    <div className="interview-avatar">
                      {interview.candidate?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <span className="interview-candidate-name">
                        {interview.candidate?.name || 'Unknown'}
                      </span>
                      <span className="interview-job-title">
                        {interview.job?.title || 'Position'}
                      </span>
                    </div>
                  </div>

                  <div className="interview-meta">
                    <span className="interview-type-badge">
                      <TypeIcon size={13} />
                      {interview.type}
                    </span>
                    <span
                      className="interview-status-badge"
                      style={{ background: STATUS_COLORS[interview.status] + '20', color: STATUS_COLORS[interview.status] }}
                    >
                      {interview.status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="interview-actions">
                  {interview.meetingLink && (
                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="interview-action-btn"
                      title="Join meeting"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                  {interview.status === 'scheduled' && (
                    <button
                      className="interview-action-btn interview-action-confirm"
                      onClick={() => updateStatus(interview._id, 'completed')}
                      title="Mark complete"
                    >
                      <CheckCircle size={14} />
                    </button>
                  )}
                  <button
                    className="interview-action-btn interview-action-cancel"
                    onClick={() => deleteInterview(interview._id)}
                    title="Cancel interview"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Interview Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Schedule Interview</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <XCircle size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Candidate</label>
                  <select
                    required
                    value={form.candidate}
                    onChange={e => setForm({ ...form, candidate: e.target.value })}
                  >
                    <option value="">Select candidate...</option>
                    {candidates.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Job Position</label>
                  <select
                    required
                    value={form.job}
                    onChange={e => setForm({ ...form, job: e.target.value })}
                  >
                    <option value="">Select job...</option>
                    {jobs.map(j => (
                      <option key={j._id} value={j._id}>{j.title}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.scheduledAt}
                    onChange={e => setForm({ ...form, scheduledAt: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input
                    type="number"
                    min="15"
                    max="480"
                    value={form.duration}
                    onChange={e => setForm({ ...form, duration: parseInt(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Interview Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                  >
                    {INTERVIEW_TYPES.map(t => (
                      <option key={t.key} value={t.key}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Meeting Link</label>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/..."
                    value={form.meetingLink}
                    onChange={e => setForm({ ...form, meetingLink: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Interviewer Names</label>
                {form.interviewerNames.map((name, idx) => (
                  <div key={idx} className="form-array-item">
                    <input
                      placeholder="Interviewer name"
                      value={name}
                      onChange={e => {
                        const names = [...form.interviewerNames];
                        names[idx] = e.target.value;
                        setForm({ ...form, interviewerNames: names });
                      }}
                    />
                    {idx === form.interviewerNames.length - 1 && (
                      <button
                        type="button"
                        className="btn-ghost-sm"
                        onClick={() => setForm({ ...form, interviewerNames: [...form.interviewerNames, ''] })}
                      >
                        <Plus size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Calendar size={16} /> Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
