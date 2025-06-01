import axiosInstance from './AxiosInstance';

const API_URL = import.meta.env.VITE_API_URL;

export const registerUser = async (userData) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/api/auth/register`, userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Registration failed');
  }
};

export const loginUser = async (userData) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/api/auth/login`, userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Login failed');
  }
};