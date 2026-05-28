import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { candidatesAPI } from '../../services/api';
import { Search, Users, Mail, Phone, MapPin, Briefcase, Building, Tag, ExternalLink, UserPlus } from 'lucide-react';
import './Candidates.css';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => { loadCandidates(); }, [search, sourceFilter]);

  const loadCandidates = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (sourceFilter) params.source = sourceFilter;
      const { data } = await candidatesAPI.getAll(params);
      setCandidates(data.candidates);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSkillCount = (c) => c.parsedData?.skills?.length || 0;
  const getExp = (c) => c.parsedData?.totalYearsExperience || 0;

  return (
    <div className="candidates-page page-enter">
      <div className="jobs-toolbar">
        <div className="jobs-toolbar-left">
          <div className="toolbar-search">
            <Search size={16} />
            <input placeholder="Search candidates..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="toolbar-select" value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}>
            <option value="">All Sources</option>
            <option value="linkedin">LinkedIn</option>
            <option value="referral">Referral</option>
            <option value="website">Website</option>
            <option value="job_board">Job Board</option>
            <option value="direct">Direct</option>
          </select>
        </div>
        <div className="jobs-toolbar-right">
          <button className="btn-primary" onClick={() => navigate('/candidates/new')}>
            <UserPlus size={16} /> Add Candidate
          </button>
        </div>
      </div>

      {loading ? (
        <div className="candidates-grid">{[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{height: '180px', borderRadius: '12px'}} />)}</div>
      ) : candidates.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <h3>No candidates found</h3>
          <p>Candidates will appear here when they apply or are added manually.</p>
          <button className="btn-primary" onClick={() => navigate('/candidates/new')} style={{marginTop: '1rem'}}>
            <UserPlus size={16} /> Add Candidate
          </button>
        </div>
      ) : (
        <div className="candidates-grid stagger-children">
          {candidates.map(c => (
            <div key={c._id} className="candidate-card glass-card" onClick={() => navigate(`/candidates/${c._id}`)}>
              <div className="candidate-card-top">
                <div className="candidate-avatar-lg">{c.name?.charAt(0)}</div>
                <div className="candidate-main-info">
                  <h3 className="candidate-name">{c.name}</h3>
                  <p className="candidate-title">{c.currentTitle || 'Candidate'}</p>
                  {c.currentCompany && <p className="candidate-company"><Building size={12} /> {c.currentCompany}</p>}
                </div>
                <span className={`source-badge source-${c.source}`}>{c.source?.replace('_', ' ')}</span>
              </div>
              <div className="candidate-card-meta">
                {c.location && <span><MapPin size={12} /> {c.location}</span>}
                {c.email && <span><Mail size={12} /> {c.email}</span>}
              </div>
              <div className="candidate-card-stats">
                <div className="candidate-stat">
                  <span className="candidate-stat-value">{getSkillCount(c)}</span>
                  <span className="candidate-stat-label">Skills</span>
                </div>
                <div className="candidate-stat">
                  <span className="candidate-stat-value">{getExp(c)}y</span>
                  <span className="candidate-stat-label">Experience</span>
                </div>
                <div className="candidate-stat">
                  <span className="candidate-stat-value">{c.parsedData?.education?.length || 0}</span>
                  <span className="candidate-stat-label">Degrees</span>
                </div>
              </div>
              {c.tags?.length > 0 && (
                <div className="candidate-tags">
                  {c.tags.slice(0, 4).map((t, i) => <span key={i} className="skill-tag">{t}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
