import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const useCart = () => {
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart')) || []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  }, [cart]);

  const addToCart = (product, variant, quantity, inventory) => {
    if (inventory === 0) {
      toast.error(`${product.name} is out of stock!`, { position: 'top-right', duration: 3000 });
      return false;
    }
    if (quantity > inventory) {
      toast.error(`Only ${inventory} items available in stock for ${product.name}!`, {
        position: 'top-right',
        duration: 3000,
      });
      return false;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) =>
          item.product._id === product._id &&
          item.variant.color === variant.color &&
          item.variant.size === variant.size
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > inventory) {
          toast.error(`Only ${inventory} items available in stock for ${product.name}!`, {
            position: 'top-right',
            duration: 3000,
          });
          return prevCart;
        }
        existingItem.quantity = newQuantity;
        return [...prevCart];
      } else {
        return [...prevCart, { product, variant, quantity }];
      }
    });

    toast.success(`${product.name} added to cart!`, { position: 'top-right', duration: 3000 });
    return true;
  };

  const removeFromCart = (productId, variant) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) =>
          !(
            item.product._id === productId &&
            item.variant.color === variant.color &&
            item.variant.size === variant.size
          )
      )
    );
  };

  const updateQuantity = (productId, variant, newQuantity, inventory) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, variant);
      return;
    }
    if (newQuantity > inventory) {
      toast.error(`Only ${inventory} items available in stock!`, {
        position: 'top-right',
        duration: 3000,
      });
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product._id === productId &&
        item.variant.color === variant.color &&
        item.variant.size === variant.size
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return { cart, addToCart, removeFromCart, updateQuantity, clearCart };
};