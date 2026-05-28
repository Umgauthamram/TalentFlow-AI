import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { candidatesAPI, aiAPI, applicationsAPI } from '../../services/api';
import {
  ArrowLeft, Mail, Phone, MapPin, Briefcase, Building,
  Globe, GitBranch, Link, Award, BookOpen, Languages,
  Star, Brain, FileText, Tag, Clock, Calendar, TrendingUp
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import './Candidates.css';

export default function CandidateDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCandidate();
  }, [id]);

  const loadCandidate = async () => {
    try {
      const [candRes, insightRes] = await Promise.all([
        candidatesAPI.getById(id),
        aiAPI.getInsights(id).catch(() => null),
      ]);
      setCandidate(candRes.data.candidate);
      if (insightRes?.data) setInsights(insightRes.data.insights);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="candidate-detail-loading">
        <div className="dashboard-loading-spinner" />
        <p>Loading candidate profile...</p>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="candidate-detail-loading">
        <p>Candidate not found.</p>
        <button className="btn-ghost" onClick={() => navigate('/candidates')}>
          <ArrowLeft size={16} /> Back to Candidates
        </button>
      </div>
    );
  }

  const parsed = candidate.parsedData || {};
  const skills = parsed.skills || [];
  const experience = parsed.experience || [];
  const education = parsed.education || [];
  const certs = parsed.certifications || [];
  const languages = parsed.languages || [];

  const skillCategories = {};
  skills.forEach(s => {
    const cat = s.level || 'intermediate';
    if (!skillCategories[cat]) skillCategories[cat] = [];
    skillCategories[cat].push(s);
  });

  const radarData = insights ? [
    { subject: 'Skills', value: insights.keyMetrics?.totalSkills * 8 || 0, max: 100 },
    { subject: 'Experience', value: Math.min((insights.keyMetrics?.totalExperience || 0) * 10, 100), max: 100 },
    { subject: 'Education', value: insights.keyMetrics?.educationLevel !== 'Unknown' ? 80 : 30, max: 100 },
    { subject: 'Certs', value: Math.min((insights.keyMetrics?.certifications || 0) * 25, 100), max: 100 },
    { subject: 'Languages', value: Math.min((insights.keyMetrics?.languages || 0) * 20, 100), max: 100 },
  ] : [];

  return (
    <div className="candidate-detail page-enter">
      <button className="btn-back" onClick={() => navigate('/candidates')}>
        <ArrowLeft size={16} /> All Candidates
      </button>

      <div className="candidate-detail-grid">
        {/* Profile Card */}
        <div className="candidate-profile-card">
          <div className="candidate-profile-header">
            <div className="candidate-large-avatar">
              {candidate.name?.charAt(0)?.toUpperCase()}
            </div>
            <h2>{candidate.name}</h2>
            <p className="candidate-title-company">
              {candidate.currentTitle || 'Candidate'}
              {candidate.currentCompany && ` at ${candidate.currentCompany}`}
            </p>
          </div>

          <div className="candidate-contact-list">
            {candidate.email && (
              <div className="candidate-contact-item">
                <Mail size={14} /><span>{candidate.email}</span>
              </div>
            )}
            {candidate.phone && (
              <div className="candidate-contact-item">
                <Phone size={14} /><span>{candidate.phone}</span>
              </div>
            )}
            {candidate.location && (
              <div className="candidate-contact-item">
                <MapPin size={14} /><span>{candidate.location}</span>
              </div>
            )}
          </div>

          <div className="candidate-social-links">
            {candidate.socialLinks?.linkedin && (
              <a href={candidate.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                <Link size={16} />
              </a>
            )}
            {candidate.socialLinks?.github && (
              <a href={candidate.socialLinks.github} target="_blank" rel="noopener noreferrer" className="social-link">
                <GitBranch size={16} />
              </a>
            )}
            {candidate.socialLinks?.portfolio && (
              <a href={candidate.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="social-link">
                <Globe size={16} />
              </a>
            )}
          </div>

          <div className="candidate-tags">
            {candidate.tags?.map((tag, i) => (
              <span key={i} className="candidate-tag"><Tag size={10} /> {tag}</span>
            ))}
            <span className="candidate-source-badge">{candidate.source || 'website'}</span>
          </div>

          {/* Radar Chart */}
          {radarData.length > 0 && (
            <div className="candidate-radar">
              <h4><Brain size={14} /> Profile Strength</h4>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <PolarRadiusAxis tick={false} domain={[0, 100]} />
                  <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="candidate-details">
          {/* Summary */}
          {parsed.summary && (
            <div className="detail-section">
              <h3><FileText size={16} /> Professional Summary</h3>
              <p className="detail-summary-text">{parsed.summary}</p>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div className="detail-section">
              <h3><Star size={16} /> Skills ({skills.length})</h3>
              <div className="skill-cloud">
                {skills.map((skill, i) => (
                  <span
                    key={i}
                    className={`skill-tag skill-${skill.level || 'intermediate'}`}
                    title={`${skill.level || 'intermediate'} — ${skill.yearsOfExperience || 0} years`}
                  >
                    {skill.name}
                    {skill.yearsOfExperience > 0 && (
                      <span className="skill-years">{skill.yearsOfExperience}y</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div className="detail-section">
              <h3><Briefcase size={16} /> Experience ({parsed.totalYearsExperience || 0} years)</h3>
              <div className="experience-timeline">
                {experience.map((exp, i) => (
                  <div key={i} className="experience-item">
                    <div className="experience-dot" />
                    <div className="experience-content">
                      <span className="experience-title">{exp.title}</span>
                      {exp.company && <span className="experience-company"><Building size={12} /> {exp.company}</span>}
                      {exp.duration && <span className="experience-duration"><Clock size={12} /> {exp.duration}</span>}
                      {exp.description && <p className="experience-desc">{exp.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className="detail-section">
              <h3><BookOpen size={16} /> Education</h3>
              <div className="education-cards">
                {education.map((edu, i) => (
                  <div key={i} className="education-card">
                    <span className="education-degree">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</span>
                    {edu.institution && <span className="education-inst">{edu.institution}</span>}
                    {edu.year && <span className="education-year"><Calendar size={11} /> {edu.year}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certs.length > 0 && (
            <div className="detail-section">
              <h3><Award size={16} /> Certifications</h3>
              <ul className="cert-list">
                {certs.map((cert, i) => (
                  <li key={i}>{cert}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <div className="detail-section">
              <h3><Languages size={16} /> Languages</h3>
              <div className="language-tags">
                {languages.map((lang, i) => (
                  <span key={i} className="language-tag">{lang}</span>
                ))}
              </div>
            </div>
          )}

          {/* AI Insights */}
          {insights && (
            <div className="detail-section">
              <h3><Brain size={16} /> AI Insights</h3>
              {insights.strengths?.length > 0 && (
                <div className="insight-group insight-strengths">
                  <h4>Strengths</h4>
                  <ul>
                    {insights.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
              {insights.improvements?.length > 0 && (
                <div className="insight-group insight-improvements">
                  <h4>Areas for Improvement</h4>
                  <ul>
                    {insights.improvements.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
