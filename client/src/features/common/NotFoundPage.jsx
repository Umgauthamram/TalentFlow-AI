import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Sparkles } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="not-found-content animate-fade-in-up">
        <div className="not-found-icon">
          <Sparkles size={48} />
        </div>
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-text">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="not-found-actions">
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>
            <Home size={16} /> Go to Dashboard
          </button>
          <button className="btn-ghost" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
