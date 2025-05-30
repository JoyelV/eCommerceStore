import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/20/solid';
import toast from 'react-hot-toast';

function ThankYouPage() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/orders/${orderNumber}`);
        setOrder(res.data);
      } catch (err) {
        console.error('Error fetching order:', err.message);
        const errorMessage = err.response?.data?.error || 'Failed to load order details';
        setError(errorMessage);
        if (err.response?.status === 404) {
          toast.error('Order not found. It may have been deleted or never existed.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  const handleRetryOrder = () => {
    // Navigate back to checkout with the same items
    const cartItems = order.items.map((item) => ({
      product: {
        _id: item.productId,
        name: item.name,
        price: item.price,
        images: [item.image],
      },
      variant: item.variant,
      quantity: item.quantity,
    }));
    navigate('/checkout', { state: { cartItems } });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-10">
        {error}
        <div className="mt-4">
          <Link to="/products" className="text-blue-500 hover:underline">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = order.items.length > 0 ? 5.0 : 0;
  const total = subtotal + shipping;

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const statusStyles = {
    Pending: 'text-yellow-500',
    Approved: 'text-green-500',
    Shipped: 'text-blue-500',
    Delivered: 'text-teal-500',
    Declined: 'text-red-500',
    Error: 'text-red-500',
  };

  const statusMessages = {
    Pending: 'Your order is being processed. You’ll receive a confirmation email soon.',
    Approved: 'Your order has been successfully placed! You’ll receive a confirmation email soon.',
    Shipped: 'Your order has been shipped! Check your email for tracking details.',
    Delivered: 'Your order has been delivered! Enjoy your purchase.',
    Declined: 'Your transaction was declined. Please try again or contact support.',
    Error: 'An error occurred while processing your order. Please try again or contact support.',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center py-12 mt-10">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-10">
          {['Approved', 'Shipped', 'Delivered'].includes(order.status) ? (
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          ) : (
            <ExclamationCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          )}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Thank You!</h1>
          <p className="text-lg md:text-xl text-gray-600 mb-2">
            Order Number: <span className="font-semibold text-blue-600">{order.orderNumber}</span>
          </p>
          <p className="text-lg md:text-xl text-gray-600 mb-2">
            Order Date: <span className="font-semibold">{formattedDate}</span>
          </p>
          <p className="text-lg md:text-xl">
            Status:{' '}
            <span className={`font-semibold ${statusStyles[order.status]}`}>
              {order.status}
            </span>
          </p>
          <p className="text-gray-600 mt-2">{statusMessages[order.status]}</p>
        </div>

        {/* Order Summary Section */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Order Summary</h2>
          {order.items.map((item, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-start gap-6 mb-4 last:mb-0 border-b pb-4 last:border-b-0 last:pb-0"
            >
              <img
                src={item.image || 'https://samples-files.com/samples/images/jpg/1920-1080-sample.jpg'}
                alt={item.name}
                className="w-full sm:w-32 h-32 object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="mb-2 text-gray-700">
                  <span className="font-medium text-gray-900">Product:</span> {item.name}
                </p>
                <p className="mb-2 text-gray-700">
                  <span className="font-medium text-gray-900">Variant:</span>{' '}
                  {item.variant.color}, {item.variant.size}
                </p>
                <p className="mb-2 text-gray-700">
                  <span className="font-medium text-gray-900">Quantity:</span> {item.quantity}
                </p>
                <p className="mb-2 text-gray-700">
                  <span className="font-medium text-gray-900">Price:</span> ${item.price.toFixed(2)}
                </p>
                <p className="mb-2 text-gray-700">
                  <span className="font-medium text-gray-900">Subtotal:</span> $
                  {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-800">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Shipping</span>
              <span className="text-gray-800">${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold text-gray-800">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Customer Details Section */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Customer Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <p className="text-gray-700">
              <span className="font-medium text-gray-900">Name:</span> {order.customer.name}
            </p>
            <p className="text-gray-700">
              <span className="font-medium text-gray-900">Email:</span> {order.customer.email}
            </p>
            <p className="text-gray-700">
              <span className="font-medium text-gray-900">Phone:</span> {order.customer.phone}
            </p>
            <p className="text-gray-700 sm:col-span-2">
              <span className="font-medium text-gray-900">Address:</span>{' '}
              {order.customer.address}, {order.customer.city}, {order.customer.state}{' '}
              {order.customer.zip}
            </p>
          </div>
        </div>

        {/* Status-Specific Actions */}
        {['Declined', 'Error'].includes(order.status) && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-8 text-center">
            <p className="mb-2">
              {order.status === 'Declined'
                ? 'Your transaction was declined. Please try again with a different payment method.'
                : 'An error occurred while processing your order. Please try again or contact support.'}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleRetryOrder}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Retry Order
              </button>
              <a
                href="mailto:support@store.com"
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Contact Support
              </a>
            </div>
          </div>
        )}

        {['Approved', 'Shipped'].includes(order.status) && (
          <div className="bg-blue-50 border border-blue-200 text-blue-600 p-4 rounded-lg mb-8 text-center">
            <p>
              Want to track your order?{' '}
              <button
                className="underline hover:text-blue-800"
                onClick={() => toast.info('Tracking feature coming soon!')}
              >
                Track your order
              </button>
              .
            </p>
          </div>
        )}

        {/* Continue Shopping Button */}
        <div className="text-center">
          <Link
            to="/products"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ThankYouPage;