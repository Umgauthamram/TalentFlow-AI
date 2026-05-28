import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { jobsAPI, candidatesAPI } from '../../services/api';
import {
  Search as SearchIcon, Filter, Briefcase, Users, MapPin,
  Star, X, ChevronDown
} from 'lucide-react';
import './Search.css';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    department: '', type: '', location: '', skills: '',
  });

  useEffect(() => {
    if (query.trim()) runSearch();
  }, [query]);

  const runSearch = async () => {
    setLoading(true);
    try {
      const [jobRes, candRes] = await Promise.all([
        jobsAPI.getAll({ search: query, ...filters }),
        candidatesAPI.getAll({ search: query }),
      ]);
      setJobs(jobRes.data.jobs || []);
      setCandidates(candRes.data.candidates || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    runSearch();
  };

  const totalResults = jobs.length + candidates.length;

  return (
    <div className="search-page page-enter">
      <div className="search-hero">
        <h1>Advanced Search</h1>
        <p>Search across all jobs, candidates, and skills</p>
        <form onSubmit={handleSearch} className="search-bar-lg">
          <SearchIcon size={20} className="search-bar-icon" />
          <input
            id="advanced-search-input"
            type="text"
            placeholder="Search jobs, candidates, skills, or departments..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button type="button" className="search-clear" onClick={() => { setQuery(''); setJobs([]); setCandidates([]); }}>
              <X size={16} />
            </button>
          )}
          <button type="submit" className="btn-primary search-submit">
            Search
          </button>
        </form>
      </div>

      {/* Filters */}
      <div className="search-filters">
        <select value={filters.department} onChange={e => setFilters({ ...filters, department: e.target.value })}>
          <option value="">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="Design">Design</option>
          <option value="Marketing">Marketing</option>
          <option value="Sales">Sales</option>
          <option value="Product">Product</option>
          <option value="HR">HR</option>
        </select>
        <select value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
          <option value="">All Types</option>
          <option value="full-time">Full Time</option>
          <option value="part-time">Part Time</option>
          <option value="contract">Contract</option>
          <option value="remote">Remote</option>
          <option value="internship">Internship</option>
        </select>
      </div>

      {/* Results Tabs */}
      {query && (
        <div className="search-results-header">
          <div className="search-tabs">
            <button className={`search-tab ${activeTab === 'all' ? 'search-tab-active' : ''}`} onClick={() => setActiveTab('all')}>
              All ({totalResults})
            </button>
            <button className={`search-tab ${activeTab === 'jobs' ? 'search-tab-active' : ''}`} onClick={() => setActiveTab('jobs')}>
              <Briefcase size={14} /> Jobs ({jobs.length})
            </button>
            <button className={`search-tab ${activeTab === 'candidates' ? 'search-tab-active' : ''}`} onClick={() => setActiveTab('candidates')}>
              <Users size={14} /> Candidates ({candidates.length})
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="search-results">
        {loading && (
          <div className="search-loading">
            <div className="dashboard-loading-spinner" />
            <p>Searching...</p>
          </div>
        )}

        {!loading && query && totalResults === 0 && (
          <div className="search-empty">
            <SearchIcon size={40} />
            <h3>No results found</h3>
            <p>Try adjusting your search terms or filters.</p>
          </div>
        )}

        {/* Jobs Results */}
        {(activeTab === 'all' || activeTab === 'jobs') && jobs.length > 0 && (
          <div className="search-section">
            {activeTab === 'all' && <h3 className="search-section-title"><Briefcase size={16} /> Jobs</h3>}
            <div className="search-cards">
              {jobs.map(job => (
                <div key={job._id} className="search-card" onClick={() => navigate(`/jobs/${job._id}`)}>
                  <div className="search-card-header">
                    <span className="search-card-title">{job.title}</span>
                    <span className={`search-card-status status-${job.status}`}>{job.status}</span>
                  </div>
                  <div className="search-card-meta">
                    <span><Briefcase size={12} /> {job.department}</span>
                    <span><MapPin size={12} /> {job.location}</span>
                    <span>{job.type}</span>
                  </div>
                  {job.skills?.length > 0 && (
                    <div className="search-card-tags">
                      {job.skills.slice(0, 5).map((skill, i) => (
                        <span key={i} className="search-card-tag">{skill}</span>
                      ))}
                      {job.skills.length > 5 && <span className="search-card-tag-more">+{job.skills.length - 5}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Candidate Results */}
        {(activeTab === 'all' || activeTab === 'candidates') && candidates.length > 0 && (
          <div className="search-section">
            {activeTab === 'all' && <h3 className="search-section-title"><Users size={16} /> Candidates</h3>}
            <div className="search-cards">
              {candidates.map(cand => (
                <div key={cand._id} className="search-card" onClick={() => navigate(`/candidates/${cand._id}`)}>
                  <div className="search-card-header">
                    <div className="search-card-avatar">{cand.name?.charAt(0)}</div>
                    <div>
                      <span className="search-card-title">{cand.name}</span>
                      <span className="search-card-subtitle">{cand.currentTitle || 'Candidate'}</span>
                    </div>
                  </div>
                  <div className="search-card-meta">
                    {cand.email && <span>{cand.email}</span>}
                    {cand.location && <span><MapPin size={12} /> {cand.location}</span>}
                  </div>
                  {cand.parsedData?.skills?.length > 0 && (
                    <div className="search-card-tags">
                      {cand.parsedData.skills.slice(0, 5).map((skill, i) => (
                        <span key={i} className="search-card-tag">{skill.name}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
