import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '';

export default function AdminOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API}/api/orders/all`, config);
      setOrders(data.orders);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const markDelivered = async (id) => {
    try {
      await axios.put(`${API}/api/orders/${id}/deliver`, {}, config);
      toast.success('Marked as delivered');
      fetchOrders();
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <h2>ShopHub Admin</h2>
        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/products">Products</Link>
        <Link to="/admin/orders" className="active">Orders</Link>
        <Link to="/">View Store</Link>
      </div>
      <div className="admin-content">
        <h1>Orders ({orders.length})</h1>
        {loading ? <div className="spinner" /> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Delivered</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{o._id.slice(-8)}</td>
                  <td>{o.user?.name || 'N/A'}<br /><span style={{ fontSize: '0.8rem', color: '#888' }}>{o.user?.email}</span></td>
                  <td>{o.items?.length}</td>
                  <td>₹{o.totalPrice?.toFixed(2)}</td>
                  <td>{o.isPaid ? <span style={{ color: '#27ae60', fontWeight: 600 }}>✓</span> : '✗'}</td>
                  <td>{o.isDelivered ? <span style={{ color: '#27ae60', fontWeight: 600 }}>✓</span> : '✗'}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>
                    {!o.isDelivered && (
                      <button className="btn btn-sm btn-secondary" onClick={() => markDelivered(o._id)}>
                        Mark Delivered
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: '#888' }}>No orders yet</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
