"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Checkout() {
  const [cart, setCart] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
  });
  const router = useRouter();

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
    setCart({1: 2, 2: 1});
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prevInfo => ({
      ...prevInfo,
      [name]: value
    }));
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    try {
      const lineItems = Object.entries(cart).map(([productId, quantity]) => ({
        product_id: parseInt(productId),
        quantity
      }));

      const orderData = {
        payment_method: "bacs",
        payment_method_title: "Direct Bank Transfer",
        set_paid: false,
        billing: {
          first_name: customerInfo.firstName,
          last_name: customerInfo.lastName,
          address_1: customerInfo.address,
          email: customerInfo.email,
        },
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
      
      router.push(`/order-confirmation?id=${order.id}`);
    } catch (err) {
      console.error("Error placing order:", err);
      setError("Failed to place order. Please try again.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Checkout</h1>
      <h2>Your Cart</h2>
      <ul>
        {Object.entries(cart).map(([productId, quantity]) => {
          const product = products.find(p => p.id.toString() === productId);
          return (
            <li key={productId}>
              {product?.name} - Quantity: {quantity} - ${product?.price * quantity}
            </li>
          );
        })}
      </ul>
      <h2>Customer Information</h2>
      <form onSubmit={placeOrder}>
        <div>
          <label htmlFor="firstName">First Name:</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={customerInfo.firstName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="lastName">Last Name:</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={customerInfo.lastName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={customerInfo.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="address">Address:</label>
          <input
            type="text"
            id="address"
            name="address"
            value={customerInfo.address}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit">Place Order</button>
      </form>
    </div>
  );
}