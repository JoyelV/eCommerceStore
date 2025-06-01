import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCartIcon } from '@heroicons/react/20/solid';
import toast from 'react-hot-toast';
import { fetchProducts, fetchProductById } from '../api/ProductApi'; 
import { useCart } from '../hooks/useCart'; 

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const { addToCart } = useCart(); 

  const fetchProductsData = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 9 };
      if (search) params.search = search;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const data = await fetchProducts(params); 
      setProducts(data.products);
      setTotalPages(data.totalPages);
      setCurrentPage(data.page);
    } catch (err) {
      console.error(err.message);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsData();
  }, []);

  const handleAddToCart = async (productId) => {
    try {
      const product = await fetchProductById(productId); 
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
      addToCart(product, defaultVariant, quantity, inventory); 
    } catch (err) {
      console.error('Error adding to cart:', err.message);
      toast.error('Failed to add product to cart. Please try again.', {
        position: 'top-right',
        duration: 3000,
      });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProductsData(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchProductsData(page);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-10">{error}</div>;
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="container mx-auto px-6 pt-24 pb-12">
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-12 tracking-tight">
          Products
        </h1>

        {/* Search and Filter */}
        <div className="mb-8 bg-white p-6 rounded-xl shadow-md">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="flex gap-4">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min Price"
                className="border p-3 rounded-lg w-32 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max Price"
                className="border p-3 rounded-lg w-32 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Search
            </button>
          </form>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:scale-105"
            >
              <img
                src={product.images?.[0] || 'https://samples-files.com/samples/images/jpg/1920-1080-sample.jpg'}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h2>
                <p className="text-gray-600 mb-4">${product.price.toFixed(2)}</p>
                <div className="flex gap-2">
                  <Link
                    to={`/product/${product._id}`}
                    className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleAddToCart(product._id)}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
                    aria-label={`Add ${product.name} to cart`}
                  >
                    <ShoppingCartIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                } transition`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductsPage;