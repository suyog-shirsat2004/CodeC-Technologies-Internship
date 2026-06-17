import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || '';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (user) {
      axios.get(`${API}/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      }).then(({ data }) => setOrder(data)).catch(() => {});
    }
  }, [id, user]);

  return (
    <div className="container" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
      <div className="success-checkmark">
        <div className="check-icon">
          <svg viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>
      <h1 style={{ marginBottom: 8 }}>Order Placed Successfully!</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        Thank you for your purchase. Your order has been confirmed.
      </p>
      {order && (
        <div style={{ background: '#fff', padding: 20, borderRadius: 12, marginBottom: 24 }}>
          <p style={{ fontWeight: 600 }}>Order #{order._id}</p>
          <p>Total: ₹{order.totalPrice?.toFixed(2)}</p>
          <p>Status: {order.isPaid ? 'Paid' : 'Pending'}</p>
        </div>
      )}
      <Link to="/" className="btn btn-primary">Continue Shopping</Link>
    </div>
  );
}
