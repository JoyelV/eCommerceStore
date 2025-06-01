import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL;

export const fetchProducts = async (params) => {
  try {
    const response = await axios.get(`${VITE_API_URL}/api/products`, { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch products');
  }
};

export const fetchProductById = async (id) => {
  try {
    const response = await axios.get(`${VITE_API_URL}/api/products/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch product');
  }
};