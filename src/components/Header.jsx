import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/20/solid';
import { useAuth } from '../context/AuthHook.js';

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [uniqueProductCount, setUniqueProductCount] = useState(0);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const updateCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      if(cart.length===0){
         setUniqueProductCount(0);
      }else{
         const uniqueProducts = new Set(cart.map((item) => item.product._id));
         setUniqueProductCount(uniqueProducts.size);
      }
    } catch (err) {
      console.error('Error parsing cart from localStorage:', err);
      setUniqueProductCount(0);
    }
  };

  useEffect(() => {
    updateCartCount();
    const handleStorageChange = () => {
      updateCartCount();
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-gray-800">
          eCommerce Store
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="text-gray-600 hover:text-blue-600 transition">
            Home
          </Link>
          <Link to="/products" className="text-gray-600 hover:text-blue-600 transition">
            Products
          </Link>
          <div className="relative">
            <Link to="/cart" className="text-gray-600 hover:text-blue-600 transition">
              Cart
            </Link>
            {uniqueProductCount > 0 && (
              <span className="absolute -top-2 -right-4 bg-blue-600 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                {uniqueProductCount}
              </span>
            )}
          </div>
        </nav>

        {/* User Actions (Desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-gray-600">Hi, {user.name}</span>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition shadow-md"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
            >
              Login
            </button>
          )}
        </div>

        {/* Hamburger Menu (Mobile) */}
        <div className="md:hidden">
          <button onClick={toggleMenu}>
            {isOpen ? (
              <XMarkIcon className="h-6 w-6 text-gray-600" />
            ) : (
              <Bars3Icon className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <nav className="md:hidden bg-white border-t border-gray-200">
          <div className="flex flex-col space-y-4 px-6 py-4">
            <Link
              to="/"
              className="text-gray-600 hover:text-blue-600 transition"
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-gray-600 hover:text-blue-600 transition"
              onClick={toggleMenu}
            >
              Products
            </Link>
            <div className="relative">
              <Link
                to="/cart"
                className="text-gray-600 hover:text-blue-600 transition"
                onClick={toggleMenu}
              >
                Cart
              </Link>
              {uniqueProductCount > 0 && (
                <span className="absolute top-0 -right-4 bg-blue-600 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                  {uniqueProductCount}
                </span>
              )}
            </div>
            {user ? (
              <>
                <span className="text-gray-600">Hi, {user.name}</span>
                <button
                  onClick={() => {
                    logout();
                    toggleMenu();
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition shadow-md text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  navigate('/login');
                  toggleMenu();
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md text-left"
              >
                Login
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

export default Header;