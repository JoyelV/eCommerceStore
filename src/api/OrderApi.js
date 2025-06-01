import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL;

export const createOrder = async (orderData) => {
  try {
    const response = await axios.post(`${VITE_API_URL}/api/orders`, orderData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to create order');
  }
};

export const fetchOrderById = async (orderNumber) => {
  try {
    const response = await axios.get(`${VITE_API_URL}/api/orders/${orderNumber}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.status === 404 ? 'Order not found (404)' : error.response?.data?.error || 'Failed to fetch order');
  }
};