import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { TrashIcon } from '@heroicons/react/20/solid';
import { fetchProductById } from '../api/ProductApi'; 
import { useCart } from '../hooks/useCart'; 

function CartPage() {
  const [inventoryData, setInventoryData] = useState({});
  const [loadingInventory, setLoadingInventory] = useState(true);
  const navigate = useNavigate();
  const { cart: cartItems, removeFromCart, updateQuantity, clearCart } = useCart(); 

  useEffect(() => {
    const fetchInventory = async () => {
      setLoadingInventory(true);
      try {
        const updatedInventory = {};
        for (const item of cartItems) {
          const product = await fetchProductById(item.product._id); 
          const variant = product.variants.find(
            (v) => v.color === item.variant.color && v.size === item.variant.size
          );
          updatedInventory[item.product._id] = variant ? variant.inventory : 0;
        }
        setInventoryData(updatedInventory);
      } catch (err) {
        console.error('Error fetching inventory:', err.message);
        toast.error('Failed to load inventory data. Please try again.');
      } finally {
        setLoadingInventory(false);
      }
    };

    if (cartItems.length > 0) {
      fetchInventory();
    } else {
      setLoadingInventory(false);
    }
  }, [cartItems]);

  const handleUpdateQuantity = (productId, variant, newQuantity) => {
    if (newQuantity < 1) {
      toast.error('Quantity cannot be less than 1.');
      return;
    }

    const availableInventory = inventoryData[productId] || 0;
    updateQuantity(productId, variant, newQuantity, availableInventory); 
  };

  const handleRemoveItem = (productId, variant) => {
    removeFromCart(productId, variant); 
    toast.success('Item removed from cart.');
  };

  const handleClearCart = () => {
    clearCart(); 
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    // Check inventory for all items
    for (const item of cartItems) {
      const availableInventory = inventoryData[item.product._id] || 0;
      if (item.quantity > availableInventory) {
        toast.error(`Only ${availableInventory} items available for ${item.product.name}. Please update your cart.`);
        return;
      }
      if (availableInventory === 0) {
        toast.error(`${item.product.name} is out of stock. Please remove it from your cart.`);
        return;
      }
    }

    // Check if cart exceeds backend limit
    if (cartItems.length > 10) {
      toast.error('Too many items in the cart (maximum 10). Please remove some items.');
      return;
    }

    navigate('/checkout', { state: { cartItems } });
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = cartItems.length > 0 ? 5.0 : 0;
  const total = subtotal + shipping;

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="container mx-auto px-6 pt-24 pb-12">
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-12 tracking-tight">
          Your Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">Your cart is empty.</p>
            <Link
              to="/products"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Items ({cartItems.length})
                </h2>
                <button
                  onClick={handleClearCart}
                  className="text-red-500 hover:text-red-700 font-semibold transition"
                >
                  Clear Cart
                </button>
              </div>
              {cartItems.map((item) => {
                const availableInventory = inventoryData[item.product._id] || 0;
                const isOutOfStock = availableInventory === 0;

                return (
                  <div
                    key={`${item.product._id}-${item.variant.color}-${item.variant.size}`}
                    className="bg-white p-4 rounded-xl shadow-md mb-4 flex flex-col sm:flex-row items-center gap-4"
                  >
                    <img
                      src={item.product.images?.[0] || 'https://samples-files.com/samples/images/jpg/1920-1080-sample.jpg'}
                      alt={item.product.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-gray-800">{item.product.name}</h2>
                      <p className="text-gray-600">
                        {item.variant.color}, {item.variant.size}
                      </p>
                      {loadingInventory ? (
                        <p className="text-gray-600 text-sm">Checking inventory...</p>
                      ) : (
                        <p className={`text-sm ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                          {isOutOfStock ? 'Out of stock' : `${availableInventory} in stock`}
                        </p>
                      )}
                      <p className="text-gray-800 font-medium">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.product._id, item.variant, item.quantity - 1)}
                          className="bg-gray-200 px-3 py-1 rounded-lg hover:bg-gray-300 transition"
                          disabled={isOutOfStock || loadingInventory}
                        >
                          -
                        </button>
                        <span className="text-gray-800">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product._id, item.variant, item.quantity + 1)}
                          className="bg-gray-200 px-3 py-1 rounded-lg hover:bg-gray-300 transition"
                          disabled={isOutOfStock || loadingInventory}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.product._id, item.variant)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <TrashIcon className="h-6 w-6" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white p-6 rounded-xl shadow-md sticky top-24">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Cart Summary</h2>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-800">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-800">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-gray-800 mt-4 border-t pt-4">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
                  disabled={loadingInventory}
                >
                  {loadingInventory ? 'Checking Inventory...' : 'Proceed to Checkout'}
                </button>
                <Link
                  to="/products"
                  className="block w-full text-center mt-4 text-blue-500 hover:underline"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;