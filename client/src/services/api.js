import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ats_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ats_token');
      localStorage.removeItem('ats_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth API ──
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users'),
};

// ── Jobs API ──
export const jobsAPI = {
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  getApplicants: (id) => api.get(`/jobs/${id}/applicants`),
};

// ── Candidates API ──
export const candidatesAPI = {
  getAll: (params) => api.get('/candidates', { params }),
  getById: (id) => api.get(`/candidates/${id}`),
  create: (data) => {
    const config = data instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } } 
      : {};
    return api.post('/candidates', data, config);
  },
  update: (id, data) => api.put(`/candidates/${id}`, data),
  delete: (id) => api.delete(`/candidates/${id}`),
};

// ── Applications API ──
export const applicationsAPI = {
  getAll: (params) => api.get('/applications', { params }),
  create: (data) => api.post('/applications', data),
  updateStage: (id, stage) => api.put(`/applications/${id}/stage`, { stage }),
  toggleShortlist: (id) => api.put(`/applications/${id}/shortlist`),
  updateScore: (id, aiScore) => api.put(`/applications/${id}/score`, { aiScore }),
  addNote: (id, text) => api.post(`/applications/${id}/notes`, { text }),
};

// ── Interviews API ──
export const interviewsAPI = {
  getAll: (params) => api.get('/interviews', { params }),
  create: (data) => api.post('/interviews', data),
  update: (id, data) => api.put(`/interviews/${id}`, data),
  delete: (id) => api.delete(`/interviews/${id}`),
};

// ── AI API ──
export const aiAPI = {
  parseResume: (data) => api.post('/ai/parse-resume', data),
  matchCandidates: (jobId) => api.post(`/ai/match/${jobId}`),
  getScore: (applicationId) => api.get(`/ai/score/${applicationId}`),
  rankCandidates: (jobId) => api.post(`/ai/rank/${jobId}`),
  getInsights: (candidateId) => api.get(`/ai/insights/${candidateId}`),
  detectDuplicates: () => api.post('/ai/detect-duplicates'),
};

// ── Analytics API ──
export const analyticsAPI = {
  getOverview: () => api.get('/analytics/overview'),
  getPipeline: () => api.get('/analytics/pipeline'),
  getHiringTrends: () => api.get('/analytics/hiring-trends'),
  getSourceEffectiveness: () => api.get('/analytics/source-effectiveness'),
  getDepartmentStats: () => api.get('/analytics/department-stats'),
};

export default api;
