import { useState, useEffect } from 'react';
import { jobsAPI, aiAPI } from '../../services/api';
import {
  Brain, Target, Star, TrendingUp, AlertTriangle,
  CheckCircle, XCircle, ChevronDown, ChevronUp,
  Users, Briefcase, Search, Zap, Award, Shield, Cpu
} from 'lucide-react';
import './AI.css';

export default function AIInsightsPage() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [rankings, setRankings] = useState([]);
  const [shortlist, setShortlist] = useState(null);
  const [duplicates, setDuplicates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDuplicates, setLoadingDuplicates] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const { data } = await jobsAPI.getAll({ status: 'active' });
      setJobs(data.jobs || []);
    } catch (err) {
      console.error('Jobs load error:', err);
    }
  };

  const runRanking = async () => {
    if (!selectedJob) return;
    setLoading(true);
    setRankings([]);
    setShortlist(null);
    try {
      const { data } = await aiAPI.rankCandidates(selectedJob);
      setRankings(data.rankings || []);
      setShortlist(data.shortlistSuggestion || null);
    } catch (err) {
      console.error('Ranking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const runDuplicateDetection = async () => {
    setLoadingDuplicates(true);
    try {
      const { data } = await aiAPI.detectDuplicates();
      setDuplicates(data);
    } catch (err) {
      console.error('Duplicate detection error:', err);
    } finally {
      setLoadingDuplicates(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#06d6a0';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getRecommendationStyle = (rec) => {
    if (rec?.includes('Highly')) return 'rec-excellent';
    if (rec?.includes('Recommended')) return 'rec-good';
    if (rec?.includes('Consider')) return 'rec-average';
    return 'rec-low';
  };

  return (
    <div className="ai-page page-enter">
      <div className="ai-page-header">
        <div className="ai-page-title">
          <div className="ai-icon-badge ai-icon-badge-accent">
            <Brain size={20} />
          </div>
          <div>
            <h1>AI Insights & Scoring</h1>
            <p>Explainable AI-powered candidate ranking, scoring, and duplicate detection</p>
          </div>
        </div>
      </div>

      {/* Job Selection */}
      <div className="ai-section">
        <div className="ai-section-header">
          <h3><Target size={16} /> Candidate Ranking</h3>
          <p>Select a job to rank all applicants using multi-factor AI scoring</p>
        </div>
        <div className="ai-job-select-row">
          <select
            className="ai-job-select"
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
          >
            <option value="">Choose a job position...</option>
            {jobs.map(j => (
              <option key={j._id} value={j._id}>{j.title} — {j.department}</option>
            ))}
          </select>
          <button
            className="btn-primary"
            onClick={runRanking}
            disabled={loading || !selectedJob}
          >
            {loading ? (
              <span className="btn-loading"><span className="auth-spinner" /> Analyzing...</span>
            ) : (
              <><Zap size={16} /> Run AI Ranking</>
            )}
          </button>
        </div>
      </div>

      {/* Shortlist Summary */}
      {shortlist && (
        <div className="ai-shortlist-banner animate-fade-in-up">
          <div className="ai-shortlist-icon"><Award size={20} /></div>
          <div className="ai-shortlist-info">
            <h4>Smart Shortlist Suggestion</h4>
            <p>{shortlist.summary}</p>
          </div>
          <span className="ai-shortlist-count">
            {shortlist.shortlistedCount} / {shortlist.totalEvaluated}
          </span>
        </div>
      )}

      {/* Rankings */}
      {rankings.length > 0 && (
        <div className="ai-rankings">
          {rankings.map((item, idx) => {
            const score = item.score;
            const isExpanded = expandedCard === idx;
            return (
              <div key={idx} className="ai-rank-card">
                <div className="ai-rank-main" onClick={() => setExpandedCard(isExpanded ? null : idx)}>
                  <div className="ai-rank-badge" style={{ background: getScoreColor(score.overall) + '20', color: getScoreColor(score.overall) }}>
                    #{item.rank}
                  </div>
                  <div className="ai-rank-info">
                    <span className="ai-rank-name">{item.candidateName}</span>
                    <span className={`ai-rank-rec ${getRecommendationStyle(item.recommendation)}`}>
                      {item.recommendation}
                    </span>
                  </div>
                  <div className="ai-rank-scores">
                    <div className="ai-score-mini" title="Overall">
                      <div className="ai-score-ring" style={{ '--score-pct': `${score.overall}%`, '--score-color': getScoreColor(score.overall) }}>
                        <span>{score.overall}</span>
                      </div>
                      <span>Overall</span>
                    </div>
                    <div className="ai-score-mini" title="Skills">
                      <div className="ai-score-ring" style={{ '--score-pct': `${score.skillMatch}%`, '--score-color': getScoreColor(score.skillMatch) }}>
                        <span>{score.skillMatch}</span>
                      </div>
                      <span>Skills</span>
                    </div>
                    <div className="ai-score-mini" title="Experience">
                      <div className="ai-score-ring" style={{ '--score-pct': `${score.experienceMatch}%`, '--score-color': getScoreColor(score.experienceMatch) }}>
                        <span>{score.experienceMatch}</span>
                      </div>
                      <span>Exp</span>
                    </div>
                    <div className="ai-score-mini" title="Education">
                      <div className="ai-score-ring" style={{ '--score-pct': `${score.educationMatch}%`, '--score-color': getScoreColor(score.educationMatch) }}>
                        <span>{score.educationMatch}</span>
                      </div>
                      <span>Edu</span>
                    </div>
                  </div>
                  <div className="ai-rank-expand">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Expanded Explanation */}
                {isExpanded && (
                  <div className="ai-rank-detail animate-fade-in-up">
                    {/* Explanation */}
                    <div className="ai-explain-block">
                      <h4><Brain size={14} /> AI Explanation</h4>
                      <p>{score.explanation}</p>
                    </div>

                    <div className="ai-explain-cols">
                      {/* Matched Skills */}
                      {score.matchedSkills?.length > 0 && (
                        <div className="ai-explain-group">
                          <h5><CheckCircle size={13} /> Matched Skills</h5>
                          <div className="ai-tag-cloud">
                            {score.matchedSkills.map((s, i) => (
                              <span key={i} className="ai-tag ai-tag-match">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Missing Skills */}
                      {score.missingSkills?.length > 0 && (
                        <div className="ai-explain-group">
                          <h5><XCircle size={13} /> Missing Skills</h5>
                          <div className="ai-tag-cloud">
                            {score.missingSkills.map((s, i) => (
                              <span key={i} className="ai-tag ai-tag-miss">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="ai-explain-cols">
                      {/* Strengths */}
                      {score.strengths?.length > 0 && (
                        <div className="ai-explain-group">
                          <h5><Star size={13} /> Strengths</h5>
                          <ul className="ai-list ai-list-success">
                            {score.strengths.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                        </div>
                      )}

                      {/* Concerns */}
                      {score.concerns?.length > 0 && (
                        <div className="ai-explain-group">
                          <h5><AlertTriangle size={13} /> Concerns</h5>
                          <ul className="ai-list ai-list-warning">
                            {score.concerns.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Keywords */}
                    {score.keywords?.length > 0 && (
                      <div className="ai-explain-group">
                        <h5><Search size={13} /> Keyword Relevance</h5>
                        <div className="ai-keywords">
                          {score.keywords.map((kw, i) => (
                            <div key={i} className="ai-keyword-item">
                              <span className="ai-keyword-word">{kw.word}</span>
                              <div className="ai-keyword-bar">
                                <div className="ai-keyword-fill" style={{ width: `${kw.relevance}%` }} />
                              </div>
                              <span className="ai-keyword-value">{kw.relevance}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Duplicate Detection */}
      <div className="ai-section ai-section-divider">
        <div className="ai-section-header">
          <h3><Shield size={16} /> Duplicate Candidate Detection</h3>
          <p>Scan all candidates for potential duplicates using fuzzy name, email, and phone matching</p>
        </div>
        <button
          className="btn-primary"
          onClick={runDuplicateDetection}
          disabled={loadingDuplicates}
        >
          {loadingDuplicates ? (
            <span className="btn-loading"><span className="auth-spinner" /> Scanning...</span>
          ) : (
            <><Shield size={16} /> Scan for Duplicates</>
          )}
        </button>

        {duplicates && (
          <div className="ai-duplicates-result animate-fade-in-up">
            <div className="ai-dup-summary">
              <span>Scanned {duplicates.totalChecked} candidates</span>
              <span className={`ai-dup-count ${duplicates.duplicatesFound > 0 ? 'ai-dup-found' : 'ai-dup-clean'}`}>
                {duplicates.duplicatesFound > 0
                  ? `${duplicates.duplicatesFound} duplicates found`
                  : 'No duplicates found ✓'}
              </span>
            </div>
            {duplicates.duplicates?.map((dup, i) => (
              <div key={i} className="ai-dup-item">
                <AlertTriangle size={14} />
                <span>Match type: <strong>{dup.matchType}</strong></span>
                <span>Confidence: <strong>{dup.confidence}%</strong></span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
