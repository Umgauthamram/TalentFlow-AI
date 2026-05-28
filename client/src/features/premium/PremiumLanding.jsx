import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Zap, Brain, Shield, Users, BarChart3,
  CheckCircle, ArrowRight, Star, Target, Award,
  FileText, GitBranch, Clock, ChevronRight, Play
} from 'lucide-react';
import './Premium.css';

const FEATURES = [
  { icon: Brain, title: 'AI Resume Parsing', desc: 'Extract skills, experience, and education from any resume format in seconds' },
  { icon: Target, title: 'Semantic Matching', desc: 'TF-IDF powered candidate-job matching with explainable scoring' },
  { icon: GitBranch, title: 'Pipeline Tracking', desc: 'Kanban-style pipeline from application to hire with drag-and-drop' },
  { icon: BarChart3, title: 'Smart Analytics', desc: 'Real-time hiring metrics, conversion rates, and trend analysis' },
  { icon: Shield, title: 'Duplicate Detection', desc: 'AI-powered fuzzy matching to eliminate duplicate candidate entries' },
  { icon: FileText, title: 'Explainable AI', desc: 'Transparent scoring with matched skills, concerns, and recommendations' },
];

const STATS = [
  { value: '10x', label: 'Faster Screening' },
  { value: '85%', label: 'Match Accuracy' },
  { value: '60%', label: 'Time Saved' },
  { value: '3x', label: 'Better Hires' },
];

const TESTIMONIALS = [
  { name: 'Sarah Chen', role: 'VP of Talent, TechCorp', text: 'TalentFlow AI transformed our hiring process. We reduced time-to-hire by 60% while improving candidate quality.' },
  { name: 'Michael Torres', role: 'HR Director, InnovateCo', text: 'The AI scoring is incredibly accurate. Our recruiters love the explainable recommendations — no more black-box decisions.' },
  { name: 'Emily Park', role: 'CTO, ScaleUp Inc', text: 'Finally an ATS that understands technical roles. The semantic matching finds candidates our team actually wants to interview.' },
];

function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const num = parseInt(target);
          const duration = 1500;
          const step = num / (duration / 16);
          let current = 0;
          const timer = setInterval(() => {
            current += step;
            if (current >= num) {
              setCount(num);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function PremiumLanding() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="premium-page">
      {/* Nav */}
      <nav className={`premium-nav ${scrolled ? 'premium-nav-scrolled' : ''}`}>
        <div className="premium-nav-inner">
          <div className="premium-logo">
            <Sparkles size={20} />
            <span>TalentFlow <b>AI</b></span>
          </div>
          <div className="premium-nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#testimonials">Reviews</a>
          </div>
          <div className="premium-nav-actions">
            <button className="premium-btn-ghost" onClick={() => navigate('/login')}>Sign In</button>
            <button className="premium-btn-primary" onClick={() => navigate('/register')}>
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="premium-hero">
        <div className="premium-hero-bg">
          <div className="premium-orb premium-orb-1" />
          <div className="premium-orb premium-orb-2" />
          <div className="premium-orb premium-orb-3" />
          <div className="premium-grid-overlay" />
        </div>
        <div className="premium-hero-content">
          <div className="premium-badge">
            <Zap size={12} /> AI-Powered Hiring Platform
          </div>
          <h1>
            Hire Smarter<br />
            with <span className="premium-gradient-text">AI</span>
          </h1>
          <p className="premium-hero-subtitle">
            Transform your recruitment process with intelligent resume parsing,
            semantic candidate matching, and explainable AI scoring.
          </p>
          <div className="premium-hero-actions">
            <button className="premium-btn-primary premium-btn-lg" onClick={() => navigate('/register')}>
              Start Hiring Today <ArrowRight size={18} />
            </button>
            <button className="premium-btn-outline premium-btn-lg" onClick={() => navigate('/login')}>
              <Play size={16} /> Watch Demo
            </button>
          </div>
          <p className="premium-hero-caption">
            <CheckCircle size={13} /> No credit card required
            <span className="premium-divider-dot" />
            <Clock size={13} /> Limited Early Access Available
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="premium-stats">
        {STATS.map((stat, i) => (
          <div key={i} className="premium-stat">
            <span className="premium-stat-value">
              <AnimatedCounter target={stat.value.replace(/[^0-9]/g, '')} suffix={stat.value.replace(/[0-9]/g, '')} />
            </span>
            <span className="premium-stat-label">{stat.label}</span>
          </div>
        ))}
      </section>

      {/* Features */}
      <section id="features" className="premium-features">
        <div className="premium-section-header">
          <span className="premium-section-badge"><Brain size={14} /> Smart Features</span>
          <h2>Find the Best Talent Faster</h2>
          <p>AI-Powered Hiring. Smarter Decisions. Better Teams.</p>
        </div>
        <div className="premium-features-grid">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="premium-feature-card">
                <div className="premium-feature-icon">
                  <Icon size={22} />
                </div>
                <h3>{feat.title}</h3>
                <p>{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="premium-how">
        <div className="premium-section-header">
          <span className="premium-section-badge"><Zap size={14} /> Simple Workflow</span>
          <h2>Transform Your Recruitment Process</h2>
          <p>From job posting to hire in four simple steps</p>
        </div>
        <div className="premium-steps">
          {[
            { step: '01', title: 'Post a Job', desc: 'Create detailed job listings with required skills and qualifications', icon: FileText },
            { step: '02', title: 'Collect Applications', desc: 'Candidates apply and resumes are automatically parsed by AI', icon: Users },
            { step: '03', title: 'AI Scoring', desc: 'Our engine ranks candidates with explainable multi-factor scoring', icon: Brain },
            { step: '04', title: 'Hire the Best', desc: 'Move top candidates through your pipeline and make great hires', icon: Award },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="premium-step">
                <div className="premium-step-number">{item.step}</div>
                <div className="premium-step-icon"><Icon size={20} /></div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                {i < 3 && <ChevronRight size={20} className="premium-step-arrow" />}
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="premium-testimonials">
        <div className="premium-section-header">
          <span className="premium-section-badge"><Star size={14} /> Trusted by Teams</span>
          <h2>What Recruiters Say</h2>
        </div>
        <div className="premium-testimonial-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="premium-testimonial-card">
              <div className="premium-testimonial-stars">
                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} />)}
              </div>
              <p>"{t.text}"</p>
              <div className="premium-testimonial-author">
                <div className="premium-testimonial-avatar">{t.name.charAt(0)}</div>
                <div>
                  <span className="premium-testimonial-name">{t.name}</span>
                  <span className="premium-testimonial-role">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="premium-cta">
        <div className="premium-cta-bg">
          <div className="premium-orb premium-orb-4" />
          <div className="premium-orb premium-orb-5" />
        </div>
        <div className="premium-cta-content">
          <h2>Start Hiring Today</h2>
          <p>Join forward-thinking teams using AI to build better teams, faster.</p>
          <div className="premium-cta-actions">
            <button className="premium-btn-white premium-btn-lg" onClick={() => navigate('/register')}>
              Get Early Access <ArrowRight size={18} />
            </button>
          </div>
          <p className="premium-cta-note">
            <Shield size={13} /> Limited Early Access Available — Enterprise-grade security included
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="premium-footer">
        <div className="premium-footer-inner">
          <div className="premium-footer-brand">
            <Sparkles size={18} />
            <span>TalentFlow AI</span>
          </div>
          <p className="premium-footer-copy">
            © 2026 TalentFlow AI by Namaah Pvt Ltd. Smart ATS Hiring Suite.
          </p>
        </div>
      </footer>
    </div>
  );
}
