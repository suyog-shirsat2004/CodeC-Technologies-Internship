import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || '';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    axios.get(`${API}/api/orders/all?limit=5`, config).then(({ data }) => {
      setRecentOrders(data.orders || []);
      const totalRevenue = (data.orders || []).reduce((sum, o) => sum + (o.totalPrice || 0), 0);
      setStats(prev => ({ ...prev, orders: data.total || 0, revenue: totalRevenue }));
    }).catch(() => {});
    axios.get(`${API}/api/products?limit=1`, config).then(({ data }) => {
      setStats(prev => ({ ...prev, products: data.total || 0 }));
    }).catch(() => {});
  }, [user]);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <h2>ShopHub Admin</h2>
        <Link to="/admin" className={isActive('/admin')}>Dashboard</Link>
        <Link to="/admin/products" className={isActive('/admin/products')}>Products</Link>
        <Link to="/admin/orders" className={isActive('/admin/orders')}>Orders</Link>
        <Link to="/">View Store</Link>
        <button onClick={logout}>Logout</button>
      </div>
      <div className="admin-content">
        <h1>Dashboard</h1>
        <div className="grid grid-3" style={{ marginBottom: 32 }}>
          <div className="card" style={{ padding: 24 }}>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>Total Products</p>
            <p style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.products}</p>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>Total Orders</p>
            <p style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.orders}</p>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>Revenue</p>
            <p style={{ fontSize: '2rem', fontWeight: 700 }}>₹{stats.revenue.toFixed(2)}</p>
          </div>
        </div>
        <h2 style={{ marginBottom: 16 }}>Recent Orders</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Delivered</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map(o => (
              <tr key={o._id}>
                <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{o._id.slice(-8)}</td>
                <td>{o.user?.name || 'N/A'}</td>
                <td>₹{o.totalPrice?.toFixed(2)}</td>
                <td>{o.isPaid ? '✓' : '✗'}</td>
                <td>{o.isDelivered ? '✓' : '✗'}</td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#888' }}>No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
