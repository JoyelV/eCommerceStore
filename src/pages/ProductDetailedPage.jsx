import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { StarIcon } from '@heroicons/react/20/solid';
import toast from 'react-hot-toast';

function ProductDetailedPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [variant, setVariant] = useState({ color: '', size: '' });
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        const fetchedProduct = res.data;
        setProduct(fetchedProduct);

        if (fetchedProduct.variants.length > 0) {
          const defaultVariant = fetchedProduct.variants[0];
          setVariant({
            color: defaultVariant.color,
            size: defaultVariant.size,
          });
          setInventory(defaultVariant.inventory);
          setSelectedImage(fetchedProduct.images?.[0] || 'https://samples-files.com/samples/images/jpg/1920-1080-sample.jpg');
        }
      } catch (err) {
        console.error('Error fetching product:', err.message);
        setError(`Failed to load product: ${err.response?.status || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product && variant.color && variant.size) {
      const selectedVariant = product.variants.find(
        (v) => v.color === variant.color && v.size === variant.size
      );
      setInventory(selectedVariant?.inventory || 0);
    }
  }, [variant, product]);

  const handleBuyNow = () => {
    if (!variant.color || !variant.size) {
      setError('Please select a color and size');
      return;
    }
    if (quantity < 1) {
      setError('Quantity must be at least 1');
      return;
    }
    if (inventory === 0) {
      setError('This item is out of stock');
      return;
    }
    if (quantity > inventory) {
      setError(`Only ${inventory} items available in stock`);
      return;
    }
    navigate('/checkout', { state: { product, variant, quantity } });
  };

  const handleAddToCart = () => {
    if (!variant.color || !variant.size) {
      setError('Please select a color and size');
      return;
    }
    if (quantity < 1) {
      setError('Quantity must be at least 1');
      return;
    }
    if (inventory === 0) {
      setError('This item is out of stock');
      return;
    }
    if (quantity > inventory) {
      setError(`Only ${inventory} items available in stock`);
      return;
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(
      (item) =>
        item.product._id === product._id &&
        item.variant.color === variant.color &&
        item.variant.size === variant.size
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > inventory) {
        setError(`Only ${inventory} items available in stock`);
        return;
      }
      existingItem.quantity = newQuantity;
    } else {
      cart.push({ product, variant, quantity });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success(`${product.name} added to cart!`, {
      position: 'top-right',
      duration: 3000,
    });
    setError(''); // Clear any existing errors
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

  if (!product) return null;

  const images = product.images?.length > 0
    ? product.images
    : ['https://samples-files.com/samples/images/jpg/1920-1080-sample.jpg'];

  const isOutOfStock = inventory === 0;

  return (
    <div className="container mx-auto p-6 max-w-6xl bg-gradient-to-b from-gray-50 to-white min-h-screen mt-10">
      <div className="mb-6">
        <Link to="/products" className="text-blue-500 hover:underline text-sm">
          ← Back to Products
        </Link>
      </div>

      <h1 className="text-4xl font-bold mb-4 text-gray-800 text-center tracking-tight">
        {product.name}
      </h1>

      <div className="flex justify-center items-center mb-6">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <StarIcon
              key={i}
              className={`h-5 w-5 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`}
            />
          ))}
        </div>
        <span className="ml-2 text-gray-600 text-sm">(128 reviews)</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/2">
          <div className="relative overflow-hidden rounded-xl shadow-lg">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-[500px] object-cover transition-transform duration-500 ease-in-out hover:scale-105"
            />
          </div>
          <div className="flex gap-3 mt-4 justify-center">
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className={`w-20 h-20 rounded-lg cursor-pointer object-cover border-2 transition-all duration-300 ease-in-out ${
                  selectedImage === img ? 'border-blue-500 scale-105' : 'border-transparent hover:border-gray-300 hover:scale-110'
                }`}
                onClick={() => setSelectedImage(img)}
              />
            ))}
          </div>
        </div>

        <div className="lg:w-1/2">
          <p className="text-gray-600 mb-6 text-lg leading-relaxed">{product.description}</p>
          <p className="text-3xl font-semibold text-gray-900 mb-4">
            ${product.price.toFixed(2)}
            <span className="text-sm font-normal text-gray-500 ml-2">USD</span>
          </p>

          {inventory !== null && (
            <p className={`text-sm mb-4 ${inventory > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {inventory > 0 ? `${inventory} in stock` : 'Out of stock'}
            </p>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex gap-3">
              {[...new Set(product.variants.map((v) => v.color))].map((color) => (
                <div key={color} className="relative group">
                  <button
                    className={`w-10 h-10 rounded-full border-2 transition-all duration-200 focus:outline-none ${
                      variant.color === color ? 'border-blue-500' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.toLowerCase() }}
                    onClick={() => setVariant({ ...variant, color })}
                  />
                  <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                    {color}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
            <div className="flex gap-3">
              {[...new Set(product.variants.map((v) => v.size))].map((size) => (
                <button
                  key={size}
                  className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                    variant.size === size
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setVariant({ ...variant, size })}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                disabled={isOutOfStock}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="border p-2 rounded-lg w-20 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isOutOfStock}
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                disabled={isOutOfStock}
              >
                +
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleBuyNow}
              className={`flex-1 py-3 rounded-lg font-semibold text-lg transition-all duration-300 shadow-md hover:shadow-lg ${
                isOutOfStock
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              disabled={isOutOfStock}
            >
              Buy Now
            </button>
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-3 rounded-lg font-semibold text-lg transition-all duration-300 shadow-md hover:shadow-lg ${
                isOutOfStock
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-gray-700 text-white hover:bg-gray-800'
              }`}
              disabled={isOutOfStock}
            >
              Add to Cart
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetailedPage;