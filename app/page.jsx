"use client";
import { useState, useEffect } from 'react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/woocommerce-proxy');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setProducts(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const addToCart = async (productId) => {
    setCart(prevCart => ({
      ...prevCart,
      [productId]: (prevCart[productId] || 0) + 1
    }));
  };

  const initiateCheckout = async () => {
    try {
      const lineItems = Object.entries(cart).map(([productId, quantity]) => ({
        product_id: parseInt(productId),
        quantity
      }));

      const orderData = {
        payment_method: "bacs",
        payment_method_title: "Direct Bank Transfer",
        set_paid: false,
        line_items: lineItems,
      };

      const response = await fetch('/api/woocommerce-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Error creating order');
      }

      const order = await response.json();
      console.log('Order created:', order);
      
      window.location.href = order.checkout_url;
    } catch (err) {
      console.error("Error initiating checkout:", err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>WooCommerce Products</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.name} - ${product.price}
            <button onClick={() => addToCart(product.id)}>
              Add to Cart
            </button>
            {cart[product.id] && <span> (In cart: {cart[product.id]})</span>}
          </li>
        ))}
      </ul>
      <h2>Cart</h2>
      <ul>
        {Object.entries(cart).map(([productId, quantity]) => {
          const product = products.find(p => p.id.toString() === productId);
          return (
            <li key={productId}>
              {product?.name} - Quantity: {quantity}
            </li>
          );
        })}
      </ul>
      <button onClick={initiateCheckout}>Proceed to Checkout</button>
    </div>
  );
}