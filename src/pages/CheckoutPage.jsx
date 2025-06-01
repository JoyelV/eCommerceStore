import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchProductById } from '../api/ProductApi'; 
import { createOrder } from '../api/OrderApi'; 
import { useCart } from '../hooks/useCart';

function CheckoutPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart(); 
  const { cartItems: initialCartItems, product, variant, quantity } = state || {};
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [cartItems, setCartItems] = useState([]);

  // Normalize cartItems 
  useEffect(() => {
    if (initialCartItems && initialCartItems.length > 0) {
      setCartItems(initialCartItems);
    } else if (product && variant && quantity) {
      setCartItems([
        {
          product: { _id: product._id, name: product.name, price: product.price, images: product.images },
          variant,
          quantity,
        },
      ]);
    }
  }, [initialCartItems, product, variant, quantity]);

  // Fetch inventory for all items
  useEffect(() => {
    const checkInventory = async () => {
      setLoadingInventory(true);
      try {
        for (const item of cartItems) {
          const fetchedProduct = await fetchProductById(item.product._id); 
          const selectedVariant = fetchedProduct.variants.find(
            (v) => v.color === item.variant.color && v.size === item.variant.size
          );
          const inventory = selectedVariant ? selectedVariant.inventory : 0;

          if (item.quantity > inventory) {
            setErrors((prev) => ({
              ...prev,
              inventory: `Only ${inventory} items available for ${item.product.name}.`,
            }));
          }
        }
      } catch (err) {
        console.error('Error checking inventory:', err.message);
        setErrors((prev) => ({
          ...prev,
          inventory: 'Failed to verify inventory. Please try again.',
        }));
      } finally {
        setLoadingInventory(false);
      }
    };

    if (cartItems.length > 0) {
      checkInventory();
    } else {
      setLoadingInventory(false);
    }
  }, [cartItems]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Full name is required';
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Invalid email format';
    if (!formData.phone || !/^\+?\d{1,4}[-.\s]?\d{1,14}$/.test(formData.phone))
      newErrors.phone = 'Invalid phone number format';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zip || !/^\d{5}(-\d{4})?$/.test(formData.zip))
      newErrors.zip = 'Invalid zip code format';
    if (!formData.cardNumber || !/^\d{16}$/.test(formData.cardNumber))
      newErrors.cardNumber = 'Card number must be 16 digits';
    if (!formData.expiry || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiry))
      newErrors.expiry = 'Expiry must be MM/YY';
    else {
      const [month, year] = formData.expiry.split('/').map(Number);
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      if (year < currentYear || (year === currentYear && month < currentMonth))
        newErrors.expiry = 'Card expired';
    }
    if (!formData.cvv || !/^\d{3}$/.test(formData.cvv))
      newErrors.cvv = 'CVV must be 3 digits';

    // Validate cart items
    if (cartItems.length > 50) {
      newErrors.items = 'Too many items in the order (maximum 50)';
    }
    cartItems.forEach((item, index) => {
      if (!item.variant.color || !item.variant.size) {
        newErrors.items = `Item at position ${index + 1} is missing variant details (color, size)`;
      }
      if (typeof item.quantity !== 'number' || item.quantity < 1 || !Number.isInteger(item.quantity)) {
        newErrors.items = `Item at position ${index + 1} has an invalid quantity (must be a positive integer)`;
      }
    });

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    if (errors.inventory) {
      toast.error(errors.inventory);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        items: cartItems.map((item) => ({
          productId: item.product._id,
          variant: item.variant,
          quantity: item.quantity,
          name: item.product.name,
          price: item.product.price,
          image: item.product.images?.[0] || undefined,
        })),
        customer: formData,
      };

      const { orderNumber, status } = await createOrder(payload); 

      if (status === 'Approved') {
        toast.success('Order placed successfully! You will receive a confirmation email soon.');
        clearCart(); 
        navigate(`/thank-you/${orderNumber}`);
      } else {
        toast.error(`Transaction ${status.toLowerCase()}. Email sent to mail, Please try again.`);
        setErrors({ submit: `Transaction ${status.toLowerCase()}. Please try again.` });
      }
    } catch (err) {
      console.error('Error placing order:', err.message);
      const errorMessage = err.message || 'Failed to place order. Please try again.';
      toast.error(errorMessage);
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-red-500 text-center py-10">
        Invalid order details
        <div className="mt-4">
          <Link to="/products" className="text-blue-500 hover:underline">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = cartItems.length > 0 ? 5.0 : 0;
  const total = subtotal + shipping;

  return (
    <div className="container mx-auto p-6 max-w-6xl bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="mb-6">
        <Link to="/products" className="text-blue-500 hover:underline text-sm">
          ← Back to Products
        </Link>
      </div>

      <h1 className="text-4xl font-bold mb-8 text-gray-800 text-center tracking-tight">
        Checkout
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <form onSubmit={handleSubmit} className="lg:w-2/3">
          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Shipping Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  placeholder="+12025550123"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="123 Main St"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  placeholder="Springfield"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className={`border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  placeholder="IL"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className={`border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.state ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                <input
                  type="text"
                  placeholder="62701 or 62701-1234"
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  className={`border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.zip ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.zip && <p className="text-red-500 text-xs mt-1">{errors.zip}</p>}
              </div>
            </div>
          </div>

          {/* Payment Details Section */}
          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Payment Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                  className={`border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry (MM/YY)</label>
                <input
                  type="text"
                  placeholder="12/26"
                  value={formData.expiry}
                  onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                  className={`border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.expiry ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  value={formData.cvv}
                  onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                  className={`border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.cvv ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
              </div>
            </div>
          </div>

          <div className="relative">
            {errors.submit && <p className="text-red-500 text-sm mb-4 text-center">{errors.submit}</p>}
            {errors.inventory && <p className="text-red-500 text-sm mb-4 text-center">{errors.inventory}</p>}
            {errors.items && <p className="text-red-500 text-sm mb-4 text-center">{errors.items}</p>}
            <button
              type="submit"
              disabled={isSubmitting || loadingInventory}
              className={`w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center ${
                (isSubmitting || loadingInventory) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : loadingInventory ? (
                'Checking Inventory...'
              ) : (
                'Place Order'
              )}
            </button>
          </div>
        </form>

        <div className="lg:w-1/3">
          <div className="bg-white p-6 rounded-xl shadow-md sticky top-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Order Summary</h2>
            {loadingInventory ? (
              <p className="text-gray-600 text-center">Checking inventory...</p>
            ) : (
              <>
                {cartItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 mb-4">
                    <img
                      src={
                        item.product.images?.[0] ||
                        'https://samples-files.com/samples/images/jpg/1920-1080-sample.jpg'
                      }
                      alt={item.product.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-gray-800 font-medium">{item.product.name}</p>
                      <p className="text-gray-600 text-sm">
                        {item.variant.color}, {item.variant.size} x {item.quantity}
                      </p>
                      <p className="text-gray-800 font-medium">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-800">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-800">${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold text-gray-800 mt-4">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;