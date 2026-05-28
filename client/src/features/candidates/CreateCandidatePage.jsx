import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { candidatesAPI } from '../../services/api';
import { ArrowLeft, UserPlus, UploadCloud, Briefcase, MapPin, Building, Target, Save, X } from 'lucide-react';
import './Candidates.css';

export default function CreateCandidatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    currentTitle: '',
    currentCompany: '',
    source: 'direct',
    tags: ''
  });
  const [resume, setResume] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setResume(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        formData.append(key, form[key]);
      });
      
      if (resume) {
        formData.append('resume', resume);
      }

      const res = await candidatesAPI.create(formData);
      navigate(`/candidates/${res.data.candidate._id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create candidate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-job-page page-enter">
      <button className="back-btn" type="button" onClick={() => navigate('/candidates')}>
        <ArrowLeft size={16} /> Back to Candidates
      </button>

      <div className="create-job-header">
        <div>
          <h1>Add Candidate Manually</h1>
          <p>Create a new candidate profile in the system.</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="create-job-form">
        {/* Basic Info */}
        <div className="form-section glass-card">
          <div className="form-section-header">
            <UserPlus size={18} />
            <h2>Basic Information</h2>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input 
                type="text" 
                name="name" 
                required 
                value={form.name} 
                onChange={handleInputChange} 
                placeholder="e.g. Jane Doe"
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input 
                type="email" 
                name="email" 
                required 
                value={form.email} 
                onChange={handleInputChange} 
                placeholder="jane.doe@example.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="tel" 
                name="phone" 
                value={form.phone} 
                onChange={handleInputChange} 
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <div className="input-with-icon">
                <MapPin size={16} />
                <input 
                  type="text" 
                  name="location" 
                  value={form.location} 
                  onChange={handleInputChange} 
                  placeholder="e.g. New York, NY"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Professional Info */}
        <div className="form-section glass-card">
          <div className="form-section-header">
            <Briefcase size={18} />
            <h2>Professional Details</h2>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Current Title</label>
              <input 
                type="text" 
                name="currentTitle" 
                value={form.currentTitle} 
                onChange={handleInputChange} 
                placeholder="e.g. Senior Software Engineer"
              />
            </div>
            <div className="form-group">
              <label>Current Company</label>
              <div className="input-with-icon">
                <Building size={16} />
                <input 
                  type="text" 
                  name="currentCompany" 
                  value={form.currentCompany} 
                  onChange={handleInputChange} 
                  placeholder="e.g. TechCorp Inc."
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Source</label>
              <div className="input-with-icon">
                <Target size={16} />
                <select name="source" value={form.source} onChange={handleInputChange}>
                  <option value="direct">Direct</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="referral">Referral</option>
                  <option value="website">Website</option>
                  <option value="job_board">Job Board</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input 
                type="text" 
                name="tags" 
                value={form.tags} 
                onChange={handleInputChange} 
                placeholder="e.g. React, Node.js, Senior"
              />
            </div>
          </div>
        </div>

        {/* Resume Upload */}
        <div className="form-section glass-card">
          <div className="form-section-header">
            <UploadCloud size={18} />
            <h2>Resume Upload (Optional)</h2>
          </div>
          
          <div className="form-group">
            <div className="file-upload-wrapper">
              <input 
                type="file" 
                id="resume-upload" 
                name="resume" 
                accept=".pdf,.doc,.docx" 
                onChange={handleFileChange}
                className="file-input-hidden"
              />
              <label htmlFor="resume-upload" className="file-upload-box">
                <UploadCloud size={32} />
                <span>{resume ? resume.name : 'Click or drag file to upload'}</span>
                <small>Supports PDF, DOC, DOCX up to 5MB</small>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button type="button" className="btn-ghost" onClick={() => navigate('/candidates')} disabled={loading}>
            <X size={16} /> Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="dashboard-loading-spinner" style={{width: 16, height: 16, borderWidth: 2}}></span> : <Save size={16} />} 
            {loading ? 'Creating...' : 'Create Candidate'}
          </button>
        </div>
      </form>
    </div>
  );
}
