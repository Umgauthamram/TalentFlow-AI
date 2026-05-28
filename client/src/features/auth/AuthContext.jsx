import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('ats_token');
    const storedUser = localStorage.getItem('ats_user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('ats_token');
        localStorage.removeItem('ats_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    setError('');
    try {
      const { data } = await authAPI.login({ email, password });
      if (data.success) {
        localStorage.setItem('ats_token', data.token);
        localStorage.setItem('ats_user', JSON.stringify(data.user));
        setUser(data.user);
        return data;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setError('');
    try {
      const { data } = await authAPI.register(userData);
      if (data.success) {
        localStorage.setItem('ats_token', data.token);
        localStorage.setItem('ats_user', JSON.stringify(data.user));
        setUser(data.user);
        return data;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ats_token');
    localStorage.removeItem('ats_user');
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isRecruiter: user?.role === 'recruiter',
    isHiringManager: user?.role === 'hiring_manager',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
