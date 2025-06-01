import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import HomePage from './pages/HomePage';
import ProductDetailedPage from './pages/ProductDetailedPage'; 
import CheckoutPage from './pages/CheckoutPage';
import ThankYouPage from './pages/ThankYouPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductPage'; 
import NotFoundPage from './pages/NotFoundPage';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <ErrorBoundary>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailedPage />} />
          <Route path="/checkout" element={
            <ProtectedRoute redirectIfAuthenticated={false}>
              <CheckoutPage />
              </ProtectedRoute>
            } />
          <Route path="/thank-you/:orderNumber" element={
            <ProtectedRoute redirectIfAuthenticated={false}>
              <ThankYouPage />
              </ProtectedRoute>
            } />
          <Route path="/cart" element={
            <ProtectedRoute redirectIfAuthenticated={false}>
            <CartPage />
            </ProtectedRoute>} />
          <Route
            path="/login"
            element={
              <ProtectedRoute redirectIfAuthenticated={true}>
                <LoginPage />
              </ProtectedRoute>
            }
          />
          <Route path="/register" element={
            <ProtectedRoute redirectIfAuthenticated={true}>
              <RegisterPage />
              </ProtectedRoute>
            } />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />
        </ErrorBoundary>
      </AuthProvider>
    </Router>
  );
}

export default App;