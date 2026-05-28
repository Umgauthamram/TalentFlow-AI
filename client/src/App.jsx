import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/AuthContext';

// Layout
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Pages
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import DashboardPage from './features/dashboard/DashboardPage';
import JobsPage from './features/jobs/JobsPage';
import CreateJobPage from './features/jobs/CreateJobPage';
import JobDetailPage from './features/jobs/JobDetailPage';
import CandidatesPage from './features/candidates/CandidatesPage';
import CreateCandidatePage from './features/candidates/CreateCandidatePage';
import CandidateDetailPage from './features/candidates/CandidateDetailPage';
import PipelinePage from './features/pipeline/PipelinePage';
import InterviewsPage from './features/interviews/InterviewsPage';
import AnalyticsPage from './features/analytics/AnalyticsPage';
import ResumeParserPage from './features/ai/ResumeParserPage';
import AIInsightsPage from './features/ai/AIInsightsPage';
import SearchPage from './features/search/SearchPage';
import PremiumLanding from './features/premium/PremiumLanding';
import NotFoundPage from './features/common/NotFoundPage';

// CSS
import './styles/reset.css';
import './styles/variables.css';
import './styles/global.css';
import './styles/animations.css';

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loader">
        <div className="page-loader-spinner" />
        <p>Loading TalentFlow AI...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout />;
}

function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Header />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/premium" element={<PremiumLanding />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/new" element={<CreateJobPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route path="/candidates" element={<CandidatesPage />} />
            <Route path="/candidates/new" element={<CreateCandidatePage />} />
            <Route path="/candidates/:id" element={<CandidateDetailPage />} />
            <Route path="/pipeline" element={<PipelinePage />} />
            <Route path="/interviews" element={<InterviewsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/ai/parser" element={<ResumeParserPage />} />
            <Route path="/ai/insights" element={<AIInsightsPage />} />
            <Route path="/search" element={<SearchPage />} />
          </Route>

          {/* Redirects & Fallback */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
