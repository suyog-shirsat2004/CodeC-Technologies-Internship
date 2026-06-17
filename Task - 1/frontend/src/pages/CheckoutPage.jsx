import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '';

export default function CheckoutPage() {
  const { cartItems, itemsPrice, shippingPrice, taxPrice, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    address: '', city: '', postalCode: '', country: 'IN',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      await axios.post(`${API}/api/payment/create-payment-intent`, { amount: totalPrice }, config);

      const orderData = {
        items: cartItems.map(item => ({
          product: item._id, name: item.name, price: item.price,
          quantity: item.qty, image: item.image,
        })),
        shippingAddress: address,
        paymentMethod: 'Dummy',
        itemsPrice: Math.round(itemsPrice * 100) / 100,
        taxPrice: Math.round(taxPrice * 100) / 100,
        shippingPrice: Math.round(shippingPrice * 100) / 100,
        totalPrice: Math.round(totalPrice * 100) / 100,
      };

      const { data: order } = await axios.post(`${API}/api/orders`, orderData, config);

      await axios.put(`${API}/api/orders/${order._id}/pay`, {
        id: 'dummy_' + Date.now(),
        status: 'succeeded',
        update_time: new Date().toISOString(),
        email_address: user.email,
      }, config);

      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-success/${order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <h1>Checkout</h1>
      <div className="form-section">
        <h3>Shipping Address</h3>
        <div className="form-group">
          <label>Address</label>
          <input value={address.address} onChange={e => setAddress({ ...address, address: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>City</label>
          <input value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} required />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label>Postal Code</label>
            <input value={address.postalCode} onChange={e => setAddress({ ...address, postalCode: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Country</label>
            <input value={address.country} onChange={e => setAddress({ ...address, country: e.target.value })} required />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Order Summary</h3>
        <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span>Items</span><span>₹{itemsPrice.toFixed(2)}</span>
        </div>
        <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span>Shipping</span><span>{shippingPrice === 0 ? 'FREE' : `₹${shippingPrice.toFixed(2)}`}</span>
        </div>
        <div className="row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span>Tax</span><span>₹{taxPrice.toFixed(2)}</span>
        </div>
        <div className="row" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.2rem', borderTop: '2px solid #eee', paddingTop: 12 }}>
          <span>Total</span><span>₹{totalPrice.toFixed(2)}</span>
        </div>
      </div>

      <div className="form-section">
        <h3>Payment</h3>
        <div className="dummy-card">
          <div className="dummy-card-brand">
            <i className="fas fa-credit-card" /> Credit / Debit Card
          </div>
          <div className="form-group">
            <label>Card Number</label>
            <div className="dummy-input-wrap">
              <input value="4242 4242 4242 4242" readOnly className="dummy-input" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Expiry</label>
              <input value="12/28" readOnly className="dummy-input" />
            </div>
            <div className="form-group">
              <label>CVV</label>
              <input value="123" readOnly className="dummy-input" />
            </div>
          </div>
          <p className="dummy-note">
            <i className="fas fa-lock" /> Secure payment
          </p>
        </div>
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
        {loading ? 'Processing...' : `Pay ₹${totalPrice.toFixed(2)}`}
      </button>
    </form>
  );
}
