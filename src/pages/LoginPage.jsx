import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/20/solid';
import { useAuth } from '../context/AuthContext'; 

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, error, loading } = useAuth(); 

  const validateForm = () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address.';
    }
    if (!password || password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.err(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="container mx-auto px-6 pt-24 pb-12 flex justify-center items-center">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">Login</h1>
          {error && (
            <p className="text-red-500 text-center mb-4 bg-red-50 p-2 rounded-lg">{error}</p>
          )}
          {loading && (
            <p className="text-gray-500 text-center mb-4">Loading...</p>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="john@example.com"
                disabled={isSubmitting || loading}
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
                disabled={isSubmitting || loading}
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
                isSubmitting || loading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              disabled={isSubmitting || loading}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="text-center text-gray-600 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-500 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;