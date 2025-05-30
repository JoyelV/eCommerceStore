import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/20/solid';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!name || name.trim().length < 2) {
      setError('Name must be at least 2 characters long.');
      return false;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="container mx-auto px-6 pt-24 pb-12 flex justify-center items-center">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">Register</h1>
          {error && (
            <p className="text-red-500 text-center mb-4 bg-red-50 p-2 rounded-lg">{error}</p>
          )}
          {success && (
            <p className="text-green-500 text-center mb-4 bg-green-50 p-2 rounded-lg">{success}</p>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="John Doe"
                disabled={isSubmitting}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="john@example.com"
                disabled={isSubmitting}
              />
            </div>
            <div className="mb-6 relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="********"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-gray-500"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-semibold text-lg transition-all shadow-md ${
                isSubmitting
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </form>
          <p className="text-center text-gray-600 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;