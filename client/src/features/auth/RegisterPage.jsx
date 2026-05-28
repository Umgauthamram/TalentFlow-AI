import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { UserPlus, Mail, Lock, User, Building, Eye, EyeOff, Sparkles } from 'lucide-react';
import './Auth.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'recruiter', department: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-orb auth-bg-orb-1" />
        <div className="auth-bg-orb auth-bg-orb-2" />
        <div className="auth-bg-orb auth-bg-orb-3" />
      </div>

      <div className="auth-container animate-fade-in-up">
        <div className="auth-header">
          <div className="auth-logo">
            <Sparkles size={28} />
            <span>TalentFlow AI</span>
          </div>
          <h1>Create Account</h1>
          <p>Join the Smart ATS Hiring Suite</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="name">Full Name</label>
            <div className="auth-input-wrapper">
              <User size={18} />
              <input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="reg-email">Email</label>
            <div className="auth-input-wrapper">
              <Mail size={18} />
              <input id="reg-email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@company.com" required />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="reg-password">Password</label>
            <div className="auth-input-wrapper">
              <Lock size={18} />
              <input id="reg-password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} placeholder="Minimum 6 characters" required minLength={6} />
              <button type="button" className="auth-toggle-pw" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="auth-row">
            <div className="auth-field">
              <label htmlFor="role">Role</label>
              <select id="role" name="role" value={formData.role} onChange={handleChange} className="auth-select">
                <option value="recruiter">Recruiter</option>
                <option value="hiring_manager">Hiring Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="auth-field">
              <label htmlFor="department">Department</label>
              <div className="auth-input-wrapper">
                <Building size={18} />
                <input id="department" name="department" value={formData.department} onChange={handleChange} placeholder="Engineering" />
              </div>
            </div>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : <><UserPlus size={18} /> Create Account</>}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
