import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobsAPI, aiAPI, candidatesAPI, applicationsAPI } from '../../services/api';
import { ArrowLeft, MapPin, Clock, DollarSign, Users, Zap, Star, ChevronDown, ChevronUp, UserPlus, XCircle } from 'lucide-react';
import './Jobs.css';

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [allCandidates, setAllCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [addingCandidate, setAddingCandidate] = useState(false);

  useEffect(() => { loadJob(); }, [id]);

  const loadJob = async () => {
    try {
      const [jobRes, appRes] = await Promise.all([
        jobsAPI.getById(id),
        jobsAPI.getApplicants(id)
      ]);
      setJob(jobRes.data.job);
      setApplicants(appRes.data.applications);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runAIRanking = async () => {
    setRanking(true);
    try {
      await aiAPI.rankCandidates(id);
      await loadJob();
    } catch (err) {
      console.error('Ranking error:', err);
    } finally {
      setRanking(false);
    }
  };

  const openAddCandidateModal = async () => {
    try {
      const res = await candidatesAPI.getAll({ limit: 200 });
      // Filter out candidates that are already applicants
      const existingCandidateIds = applicants.map(a => a.candidate?._id);
      const available = res.data.candidates.filter(c => !existingCandidateIds.includes(c._id));
      setAllCandidates(available);
      setShowModal(true);
    } catch (err) {
      console.error('Error loading candidates:', err);
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!selectedCandidate) return;
    
    setAddingCandidate(true);
    try {
      await applicationsAPI.create({
        job: id,
        candidate: selectedCandidate,
        stage: 'applied'
      });
      setShowModal(false);
      setSelectedCandidate('');
      await loadJob();
    } catch (err) {
      console.error('Add candidate error:', err);
      alert(err.response?.data?.message || 'Failed to add candidate');
    } finally {
      setAddingCandidate(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--accent)';
    if (score >= 40) return 'var(--warning)';
    return 'var(--danger)';
  };

  if (loading) return <div className="dashboard-loading"><div className="dashboard-loading-spinner" /><p>Loading job...</p></div>;
  if (!job) return <div className="empty-state"><h3>Job not found</h3></div>;

  return (
    <div className="job-detail-page page-enter">
      <button className="back-btn" onClick={() => navigate('/jobs')}>
        <ArrowLeft size={16} /> Back to Jobs
      </button>

      <div className="job-detail-header">
        <div>
          <h1>{job.title}</h1>
          <p className="job-detail-dept">{job.department}</p>
          <div className="job-detail-meta">
            <span><MapPin size={14} /> {job.location}</span>
            <span><Clock size={14} /> {job.type}</span>
            <span><DollarSign size={14} /> {job.salary?.min && job.salary?.max ? `$${Math.round(job.salary.min/1000)}K — $${Math.round(job.salary.max/1000)}K` : 'Not specified'}</span>
            <span><Users size={14} /> {job.applicantCount} applicants</span>
          </div>
        </div>
        <div className="job-detail-actions">
          <span className={`job-status-badge status-${job.status}`}>{job.status}</span>
        </div>
      </div>

      <div className="job-detail-grid">
        <div className="job-detail-main">
          <div className="form-card">
            <h3>Description</h3>
            <p className="job-description-text">{job.description}</p>
          </div>
          {job.requirements?.length > 0 && (
            <div className="form-card">
              <h3>Requirements</h3>
              <ul className="job-list">{job.requirements.map((r, i) => <li key={i}>{r}</li>)}</ul>
            </div>
          )}
          {job.skills?.length > 0 && (
            <div className="form-card">
              <h3>Required Skills</h3>
              <div className="job-card-skills">{job.skills.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}</div>
            </div>
          )}
        </div>

        <div className="job-detail-sidebar">
          <div className="form-card">
            <div className="applicants-header">
              <h3><Users size={16} /> Applicants ({applicants.length})</h3>
              <div style={{display: 'flex', gap: '8px'}}>
                <button className="btn-sm-ghost" onClick={openAddCandidateModal}>
                  <UserPlus size={14} /> Add
                </button>
                <button className="btn-sm-primary" onClick={runAIRanking} disabled={ranking}>
                  <Zap size={14} /> {ranking ? 'Ranking...' : 'AI Rank'}
                </button>
              </div>
            </div>
            <div className="applicants-list">
              {applicants.length === 0 ? (
                <p className="no-applicants">No applicants yet</p>
              ) : (
                applicants.sort((a, b) => (b.aiScore?.overall || 0) - (a.aiScore?.overall || 0)).map(app => (
                  <div key={app._id} className="applicant-card" onClick={() => navigate(`/candidates/${app.candidate?._id}`)}>
                    <div className="applicant-avatar">{app.candidate?.name?.charAt(0)}</div>
                    <div className="applicant-info">
                      <span className="applicant-name">{app.candidate?.name}</span>
                      <span className="applicant-title">{app.candidate?.currentTitle || 'Candidate'}</span>
                    </div>
                    <div className="applicant-score" style={{ color: getScoreColor(app.aiScore?.overall || 0) }}>
                      {app.aiScore?.overall || '—'}
                    </div>
                    <span className={`job-status-badge stage-${app.stage}`}>{app.stage}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Candidate to Job</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <XCircle size={20} />
              </button>
            </div>
            <form onSubmit={handleAddCandidate} className="modal-body">
              <div className="form-group">
                <label>Select Candidate</label>
                <select 
                  required 
                  value={selectedCandidate} 
                  onChange={e => setSelectedCandidate(e.target.value)}
                >
                  <option value="">-- Choose a candidate --</option>
                  {allCandidates.map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.email})</option>
                  ))}
                </select>
                {allCandidates.length === 0 && (
                  <small style={{color: 'var(--text-light)', marginTop: '4px', display: 'block'}}>
                    No available candidates to add. Create one from the Candidates page first.
                  </small>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={!selectedCandidate || addingCandidate}>
                  {addingCandidate ? 'Adding...' : 'Add Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
