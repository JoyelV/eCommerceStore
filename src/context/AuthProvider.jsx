import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (storedUser && storedAccessToken && storedRefreshToken) {
      setUser(JSON.parse(storedUser));
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const { data } = await axios.post('http://localhost:5000/api/auth/refresh-token', {
              refreshToken,
            });
            setAccessToken(data.accessToken);
            localStorage.setItem('accessToken', data.accessToken);
            originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
            return axios(originalRequest);
          } catch (err) {
            logout();
            return Promise.reject(err);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [refreshToken, logout]);

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      setUser(data.user);
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      navigate('/');
    } catch (error) {
      throw error.response?.data?.error || 'Login failed';
    }
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}