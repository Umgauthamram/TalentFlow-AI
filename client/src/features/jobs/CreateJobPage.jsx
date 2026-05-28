import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsAPI } from '../../services/api';
import { Save, X, Briefcase, MapPin, DollarSign, FileText, List } from 'lucide-react';
import './Jobs.css';

export default function CreateJobPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', department: '', location: '', type: 'full-time',
    experience: '1-3 years', description: '', 
    salary: { min: '', max: '', currency: 'USD' },
    status: 'active', priority: 'medium',
    requirements: '', responsibilities: '', skills: '', benefits: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('salary.')) {
      const key = name.split('.')[1];
      setForm(prev => ({ ...prev, salary: { ...prev.salary, [key]: value } }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const jobData = {
        ...form,
        salary: { min: Number(form.salary.min) || 0, max: Number(form.salary.max) || 0, currency: form.salary.currency },
        requirements: form.requirements.split('\n').filter(r => r.trim()),
        responsibilities: form.responsibilities.split('\n').filter(r => r.trim()),
        skills: form.skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
        benefits: form.benefits.split('\n').filter(b => b.trim())
      };
      await jobsAPI.create(jobData);
      navigate('/jobs');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create job');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="job-form-page page-enter">
      <h2>Create New Job Posting</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-card">
          <h3><Briefcase size={18} /> Basic Information</h3>
          <div className="form-grid">
            <div className="form-field full-width">
              <label>Job Title *</label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Senior React Developer" required />
            </div>
            <div className="form-field">
              <label>Department *</label>
              <select name="department" value={form.department} onChange={handleChange} required>
                <option value="">Select department</option>
                <option>Engineering</option><option>Design</option><option>Product</option>
                <option>Marketing</option><option>Sales</option><option>Data</option>
                <option>Operations</option><option>HR</option>
              </select>
            </div>
            <div className="form-field">
              <label>Location *</label>
              <input name="location" value={form.location} onChange={handleChange} placeholder="San Francisco, CA" required />
            </div>
            <div className="form-field">
              <label>Job Type</label>
              <select name="type" value={form.type} onChange={handleChange}>
                <option value="full-time">Full-time</option><option value="part-time">Part-time</option>
                <option value="contract">Contract</option><option value="remote">Remote</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            <div className="form-field">
              <label>Experience Level</label>
              <select name="experience" value={form.experience} onChange={handleChange}>
                <option>0-1 years</option><option>1-3 years</option><option>3-5 years</option>
                <option>5-8 years</option><option>8+ years</option>
              </select>
            </div>
            <div className="form-field">
              <label>Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange}>
                <option value="low">Low</option><option value="medium">Medium</option>
                <option value="high">High</option><option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="form-field">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="active">Active</option><option value="draft">Draft</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-card">
          <h3><DollarSign size={18} /> Compensation</h3>
          <div className="form-grid">
            <div className="form-field">
              <label>Min Salary</label>
              <input name="salary.min" type="number" value={form.salary.min} onChange={handleChange} placeholder="80000" />
            </div>
            <div className="form-field">
              <label>Max Salary</label>
              <input name="salary.max" type="number" value={form.salary.max} onChange={handleChange} placeholder="120000" />
            </div>
          </div>
        </div>

        <div className="form-card">
          <h3><FileText size={18} /> Description</h3>
          <div className="form-field">
            <label>Job Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe the role, team, and what success looks like..." rows={5} required />
          </div>
        </div>

        <div className="form-card">
          <h3><List size={18} /> Requirements & Skills</h3>
          <div className="form-grid">
            <div className="form-field">
              <label>Requirements (one per line)</label>
              <textarea name="requirements" value={form.requirements} onChange={handleChange} placeholder="Bachelor's degree in CS&#10;3+ years React experience&#10;Strong TypeScript skills" rows={4} />
            </div>
            <div className="form-field">
              <label>Responsibilities (one per line)</label>
              <textarea name="responsibilities" value={form.responsibilities} onChange={handleChange} placeholder="Build reusable components&#10;Mentor junior developers&#10;Code reviews" rows={4} />
            </div>
            <div className="form-field full-width">
              <label>Required Skills (comma separated)</label>
              <input name="skills" value={form.skills} onChange={handleChange} placeholder="react, typescript, node.js, css, git" />
            </div>
            <div className="form-field full-width">
              <label>Benefits (one per line)</label>
              <textarea name="benefits" value={form.benefits} onChange={handleChange} placeholder="Health insurance&#10;Stock options&#10;Remote work" rows={3} />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/jobs')}><X size={16} /> Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : <><Save size={16} /> Publish Job</>}
          </button>
        </div>
      </form>
    </div>
  );
}
