import { useState } from 'react';
import { aiAPI } from '../../services/api';
import {
  FileText, Upload, Cpu, Sparkles, Star, Briefcase,
  BookOpen, Award, Languages, Clock, ChevronDown, ChevronUp,
  CheckCircle, AlertCircle, Zap
} from 'lucide-react';
import './AI.css';

const SAMPLE_RESUME = `John Smith
Senior Full Stack Developer
Email: john.smith@email.com | Phone: +1 (555) 123-4567
Location: San Francisco, CA
LinkedIn: linkedin.com/in/johnsmith | GitHub: github.com/johnsmith

PROFESSIONAL SUMMARY
Experienced Full Stack Developer with 7+ years of professional experience in building scalable web applications. Proficient in React, Node.js, TypeScript, and cloud technologies. Led teams of 5-8 developers and delivered high-impact projects for Fortune 500 clients.

SKILLS
JavaScript, TypeScript, React, React.js, Next.js, Node.js, Express.js, Python, Django, PostgreSQL, MongoDB, Redis, Docker, Kubernetes, AWS, Git, CI/CD, GraphQL, REST APIs, Agile, Scrum, Machine Learning, TensorFlow

EXPERIENCE
Senior Full Stack Developer at TechCorp Inc.
2021 - Present
Led development of microservices architecture serving 2M+ users. Implemented CI/CD pipelines reducing deployment time by 60%. Mentored junior developers and conducted code reviews.

Full Stack Developer at StartupXYZ
2018 - 2021
Built customer-facing React applications with Node.js backend. Designed and implemented PostgreSQL database schemas. Integrated third-party APIs including Stripe, Twilio, and SendGrid.

Junior Developer at WebAgency
2016 - 2018
Developed responsive websites using HTML, CSS, JavaScript. Collaborated with design team on UI/UX improvements.

EDUCATION
Master of Science in Computer Science
Stanford University, 2016

Bachelor of Science in Computer Science
UC Berkeley, 2014

CERTIFICATIONS
AWS Certified Solutions Architect
Google Cloud Professional Data Engineer
Certified Scrum Master (CSM)

LANGUAGES
English, Spanish, Mandarin`;

export default function ResumeParserPage() {
  const [resumeText, setResumeText] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const handleParse = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    setParsedData(null);
    try {
      const { data } = await aiAPI.parseResume({ resumeText });
      setParsedData(data.parsedData);
    } catch (err) {
      console.error('Parse error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    setResumeText(SAMPLE_RESUME);
    setParsedData(null);
  };

  const getLevelColor = (level) => {
    const colors = {
      expert: '#06d6a0',
      advanced: '#3b82f6',
      intermediate: '#8b5cf6',
      beginner: '#94a3b8',
    };
    return colors[level] || colors.intermediate;
  };

  return (
    <div className="ai-page page-enter">
      <div className="ai-page-header">
        <div className="ai-page-title">
          <div className="ai-icon-badge">
            <Cpu size={20} />
          </div>
          <div>
            <h1>AI Resume Parser</h1>
            <p>Extract structured data from resumes using NLP-powered analysis</p>
          </div>
        </div>
      </div>

      <div className="parser-layout">
        {/* Input Section */}
        <div className="parser-input-section">
          <div className="parser-input-header">
            <h3><FileText size={16} /> Resume Text</h3>
            <button className="btn-ghost-sm-text" onClick={loadSample}>
              <Sparkles size={13} /> Load Sample
            </button>
          </div>
          <textarea
            className="parser-textarea"
            placeholder="Paste resume text here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={20}
          />
          <div className="parser-actions">
            <button
              className="btn-primary btn-lg"
              onClick={handleParse}
              disabled={loading || !resumeText.trim()}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="auth-spinner" /> Analyzing...
                </span>
              ) : (
                <>
                  <Zap size={16} /> Parse with AI
                </>
              )}
            </button>
            <span className="parser-hint">{resumeText.length} characters</span>
          </div>
        </div>

        {/* Results Section */}
        <div className="parser-results-section">
          {!parsedData && !loading && (
            <div className="parser-empty">
              <Cpu size={48} />
              <h3>Paste a resume to begin</h3>
              <p>Our AI engine will extract skills, experience, education, certifications, and more.</p>
            </div>
          )}

          {loading && (
            <div className="parser-analyzing">
              <div className="parser-analyzing-pulse" />
              <h3>Analyzing resume...</h3>
              <p>Extracting structured data with NLP</p>
            </div>
          )}

          {parsedData && (
            <div className="parser-results animate-fade-in-up">
              {/* Summary */}
              {parsedData.summary && (
                <div className="parser-result-block">
                  <h4><FileText size={14} /> Summary</h4>
                  <p className="parser-summary">{parsedData.summary}</p>
                </div>
              )}

              {/* Skills */}
              {parsedData.skills?.length > 0 && (
                <div className="parser-result-block">
                  <h4><Star size={14} /> Skills Extracted ({parsedData.skills.length})</h4>
                  <div className="parser-skill-cloud">
                    {parsedData.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="parser-skill-tag"
                        style={{ borderColor: getLevelColor(skill.level) }}
                      >
                        <span className="parser-skill-dot" style={{ background: getLevelColor(skill.level) }} />
                        {skill.name}
                        <span className="parser-skill-level">{skill.level}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {parsedData.experience?.length > 0 && (
                <div className="parser-result-block">
                  <h4><Briefcase size={14} /> Experience ({parsedData.totalYearsExperience} years total)</h4>
                  <div className="parser-exp-list">
                    {parsedData.experience.map((exp, i) => (
                      <div key={i} className="parser-exp-item">
                        <div className="parser-exp-header">
                          <span className="parser-exp-title">{exp.title}</span>
                          {exp.company && <span className="parser-exp-company">{exp.company}</span>}
                        </div>
                        {exp.duration && (
                          <span className="parser-exp-duration"><Clock size={11} /> {exp.duration}</span>
                        )}
                        {exp.description && <p className="parser-exp-desc">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {parsedData.education?.length > 0 && (
                <div className="parser-result-block">
                  <h4><BookOpen size={14} /> Education</h4>
                  {parsedData.education.map((edu, i) => (
                    <div key={i} className="parser-edu-item">
                      <span className="parser-edu-degree">{edu.degree}</span>
                      {edu.field && <span className="parser-edu-field"> in {edu.field}</span>}
                      {edu.institution && <span className="parser-edu-inst">{edu.institution}</span>}
                      {edu.year && <span className="parser-edu-year">{edu.year}</span>}
                    </div>
                  ))}
                </div>
              )}

              {/* Certifications */}
              {parsedData.certifications?.length > 0 && (
                <div className="parser-result-block">
                  <h4><Award size={14} /> Certifications</h4>
                  <ul className="parser-cert-list">
                    {parsedData.certifications.map((cert, i) => (
                      <li key={i}><CheckCircle size={12} /> {cert}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Languages */}
              {parsedData.languages?.length > 0 && (
                <div className="parser-result-block">
                  <h4><Languages size={14} /> Languages</h4>
                  <div className="parser-lang-tags">
                    {parsedData.languages.map((lang, i) => (
                      <span key={i} className="parser-lang-tag">{lang}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw JSON Toggle */}
              <button
                className="parser-raw-toggle"
                onClick={() => setShowRaw(!showRaw)}
              >
                {showRaw ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {showRaw ? 'Hide' : 'Show'} Raw JSON
              </button>
              {showRaw && (
                <pre className="parser-raw-json">
                  {JSON.stringify(parsedData, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
