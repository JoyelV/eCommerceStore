import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser } from '../api/AuthApi';

export const AuthContext = createContext(); 

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (storedUser && storedAccessToken && storedRefreshToken) {
      try {
        setUser(JSON.parse(storedUser));
        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);
      } catch (err) {
        console.error('Error parsing stored auth data:', err);
        setError('Failed to load authentication data. Please log in again.');
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const response = await loginUser({ email, password });
      const { user: userData, accessToken: newAccessToken, refreshToken: newRefreshToken } = response;

      setUser(userData);
      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      return response;
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setError('');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const refreshAccessToken = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to refresh token');

      const { accessToken: newAccessToken } = data;
      setAccessToken(newAccessToken);
      localStorage.setItem('accessToken', newAccessToken);
      return newAccessToken;
    } catch (err) {
      setError('Session expired. Please log in again.');
      logout();
      throw err;
    }
  };

  const value = {
    user,
    accessToken,
    refreshToken,
    loading,
    error,
    login,
    logout,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};