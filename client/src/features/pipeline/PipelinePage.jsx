import { useState, useEffect } from 'react';
import { applicationsAPI, jobsAPI } from '../../services/api';
import {
  GitBranch, Search, Filter, ChevronDown, ChevronRight,
  Star, Clock, User, Briefcase, GripVertical, MoreHorizontal,
  ArrowRight, Check, X, MessageSquare
} from 'lucide-react';
import './Pipeline.css';

const STAGES = [
  { key: 'applied', label: 'Applied', color: '#6366f1' },
  { key: 'screening', label: 'Screening', color: '#8b5cf6' },
  { key: 'interview', label: 'Interview', color: '#3b82f6' },
  { key: 'assessment', label: 'Assessment', color: '#06b6d4' },
  { key: 'offer', label: 'Offer', color: '#10b981' },
  { key: 'hired', label: 'Hired', color: '#06d6a0' },
];

export default function PipelinePage() {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [draggedApp, setDraggedApp] = useState(null);

  useEffect(() => {
    loadData();
  }, [selectedJob]);

  const loadData = async () => {
    try {
      const [appRes, jobRes] = await Promise.all([
        applicationsAPI.getAll(selectedJob ? { job: selectedJob } : {}),
        jobsAPI.getAll({ status: 'active' }),
      ]);
      setApplications(appRes.data.applications || []);
      setJobs(jobRes.data.jobs || []);
    } catch (err) {
      console.error('Pipeline load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const moveToStage = async (appId, newStage) => {
    try {
      await applicationsAPI.updateStage(appId, newStage);
      setApplications(prev =>
        prev.map(a => a._id === appId ? { ...a, stage: newStage } : a)
      );
    } catch (err) {
      console.error('Stage update error:', err);
    }
  };

  const handleDragStart = (e, app) => {
    setDraggedApp(app);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, stage) => {
    e.preventDefault();
    if (draggedApp && draggedApp.stage !== stage) {
      moveToStage(draggedApp._id, stage);
    }
    setDraggedApp(null);
  };

  const getStageApps = (stageKey) => {
    return applications.filter(a => {
      if (a.stage !== stageKey) return false;
      if (searchTerm) {
        const name = a.candidate?.name?.toLowerCase() || '';
        const title = a.job?.title?.toLowerCase() || '';
        return name.includes(searchTerm.toLowerCase()) ||
               title.includes(searchTerm.toLowerCase());
      }
      return true;
    });
  };

  const getScoreClass = (score) => {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-average';
    return 'score-low';
  };

  if (loading) {
    return (
      <div className="pipeline-loading">
        <div className="dashboard-loading-spinner" />
        <p>Loading pipeline...</p>
      </div>
    );
  }

  return (
    <div className="pipeline page-enter">
      <div className="pipeline-header">
        <div className="pipeline-title">
          <GitBranch size={22} />
          <h1>Candidate Pipeline</h1>
          <span className="pipeline-count">{applications.length} candidates</span>
        </div>
        <div className="pipeline-controls">
          <div className="pipeline-search">
            <Search size={15} />
            <input
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="pipeline-job-filter"
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
          >
            <option value="">All Jobs</option>
            {jobs.map(j => (
              <option key={j._id} value={j._id}>{j.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="pipeline-board">
        {STAGES.map(stage => {
          const stageApps = getStageApps(stage.key);
          return (
            <div
              key={stage.key}
              className={`pipeline-column ${draggedApp ? 'pipeline-column-droppable' : ''}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.key)}
            >
              <div className="pipeline-column-header">
                <div className="pipeline-column-title">
                  <span className="pipeline-stage-indicator" style={{ background: stage.color }} />
                  <span>{stage.label}</span>
                </div>
                <span className="pipeline-column-count">{stageApps.length}</span>
              </div>

              <div className="pipeline-column-body">
                {stageApps.map(app => (
                  <div
                    key={app._id}
                    className="pipeline-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, app)}
                  >
                    <div className="pipeline-card-top">
                      <div className="pipeline-card-avatar">
                        {app.candidate?.name?.charAt(0) || '?'}
                      </div>
                      <div className="pipeline-card-info">
                        <span className="pipeline-card-name">{app.candidate?.name}</span>
                        <span className="pipeline-card-title">{app.candidate?.currentTitle || 'Candidate'}</span>
                      </div>
                      {app.isShortlisted && (
                        <Star size={14} className="pipeline-card-star" />
                      )}
                    </div>

                    <div className="pipeline-card-job">
                      <Briefcase size={12} />
                      <span>{app.job?.title || 'Position'}</span>
                    </div>

                    {app.aiScore?.overall > 0 && (
                      <div className="pipeline-card-score">
                        <div className="pipeline-score-bar">
                          <div
                            className={`pipeline-score-fill ${getScoreClass(app.aiScore.overall)}`}
                            style={{ width: `${app.aiScore.overall}%` }}
                          />
                        </div>
                        <span className={`pipeline-score-value ${getScoreClass(app.aiScore.overall)}`}>
                          {app.aiScore.overall}%
                        </span>
                      </div>
                    )}

                    <div className="pipeline-card-actions">
                      {stage.key !== 'hired' && (
                        <button
                          className="pipeline-card-btn"
                          onClick={() => {
                            const nextIdx = STAGES.findIndex(s => s.key === stage.key) + 1;
                            if (nextIdx < STAGES.length) {
                              moveToStage(app._id, STAGES[nextIdx].key);
                            }
                          }}
                          title="Move to next stage"
                        >
                          <ArrowRight size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {stageApps.length === 0 && (
                  <div className="pipeline-empty">
                    <p>No candidates</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
