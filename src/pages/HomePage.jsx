import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCartIcon } from '@heroicons/react/20/solid';
import axios from 'axios';
import toast from 'react-hot-toast';

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`, {
          params: { limit: 6 }, 
        });
        const fetchedProducts = Array.isArray(data.products) ? data.products : [];
        setProducts(fetchedProducts);
      } catch (err) {
        console.error('Error fetching products:', err.message);
        setError('Failed to load products. Please try again.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Add to Cart logic with inventory validation
  const addToCart = async (productId) => {
    try {
      const { data: product } = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/${productId}`);

      let defaultVariant = { color: '', size: '' };
      let inventory = 0;
      if (product.variants && product.variants.length > 0) {
        defaultVariant = {
          color: product.variants[0].color,
          size: product.variants[0].size,
        };
        inventory = product.variants[0].inventory || 0;
      } else {
        defaultVariant = { color: 'default', size: 'default' };
      }

      const quantity = 1;

      if (inventory === 0) {
        toast.error(`${product.name} is out of stock!`, {
          position: 'top-right',
          duration: 3000,
        });
        return;
      }

      if (quantity > inventory) {
        toast.error(`Only ${inventory} items available in stock for ${product.name}!`, {
          position: 'top-right',
          duration: 3000,
        });
        return;
      }

      // Add to cart logic
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const existingItem = cart.find(
        (item) =>
          item.product._id === product._id &&
          item.variant.color === defaultVariant.color &&
          item.variant.size === defaultVariant.size
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > inventory) {
          toast.error(`Only ${inventory} items available in stock for ${product.name}!`, {
            position: 'top-right',
            duration: 3000,
          });
          return;
        }
        existingItem.quantity = newQuantity;
      } else {
        cart.push({ product, variant: defaultVariant, quantity });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated')); 
      toast.success(`${product.name} added to cart!`, {
        position: 'top-right',
        duration: 3000,
      });
    } catch (err) {
      console.error('Error adding to cart:', err.message);
      toast.error('Failed to add product to cart. Please try again.', {
        position: 'top-right',
        duration: 3000,
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-red-500 text-center py-10">
        {error}
        <div className="mt-4">
          <Link to="/products" className="text-blue-500 hover:underline">
            Go to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r bg-gray-50 text-gray-800 py-20 mt-10">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4 tracking-tight">Welcome to Our Store</h1>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Discover a wide range of high-quality products tailored to your needs. Shop now and enjoy exclusive offers!
          </p>
          <Link
            to="/products"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-md"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="container mx-auto px-6 py-05">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Featured Products</h2>
          <Link
            to="/products"
            className="text-blue-600 hover:underline font-semibold text-lg transition"
          >
            View More Products →
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-gray-600 text-center">No products available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.slice(0, 6).map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="relative">
                  <img
                    src={
                      product.images?.[0] ||
                      'https://samples-files.com/samples/images/jpg/1920-1080-sample.jpg'
                    }
                    alt={product.name}
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute top-0 right-0 m-2 opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => addToCart(product._id)}
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-md"
                      aria-label={`Add ${product.name} to cart`}
                    >
                      <ShoppingCartIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                    {product.description || 'No description available.'}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-xl font-semibold text-gray-900">
                      ${product.price.toFixed(2)}
                    </p>
                    <Link
                      to={`/product/${product._id}`}
                      className="text-blue-600 hover:underline font-medium transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default HomePage;