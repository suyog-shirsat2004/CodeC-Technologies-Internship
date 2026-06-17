import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '';

export default function AdminProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '', description: '', price: '', category: '', brand: '',
    image: '', countInStock: '', features: '',
  });

  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`${API}/api/products?limit=100`, config);
      setProducts(data.products);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', category: '', brand: '', image: '', countInStock: '', features: '' });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name, description: p.description, price: p.price, category: p.category,
      brand: p.brand || '', image: p.image, countInStock: p.countInStock,
      features: (p.features || []).join(', '),
    });
    setEditing(p._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, price: Number(form.price), countInStock: Number(form.countInStock), features: form.features.split(',').map(f => f.trim()).filter(Boolean) };
    try {
      if (editing) {
        await axios.put(`${API}/api/products/${editing}`, payload, config);
        toast.success('Product updated');
      } else {
        await axios.post(`${API}/api/products`, payload, config);
        toast.success('Product created');
      }
      resetForm();
      fetchProducts();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`${API}/api/products/${id}`, config);
      toast.success('Product deleted');
      fetchProducts();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <h2>ShopHub Admin</h2>
        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/products" className="active">Products</Link>
        <Link to="/admin/orders">Orders</Link>
        <Link to="/">View Store</Link>
      </div>
      <div className="admin-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ margin: 0 }}>Products ({products.length})</h1>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
            {showForm ? 'Cancel' : 'Add Product'}
          </button>
        </div>

        {showForm && (
          <div className="card" style={{ padding: 24, marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16 }}>{editing ? 'Edit Product' : 'New Product'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Price</label>
                  <input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Brand</label>
                  <input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Image URL</label>
                  <input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Count In Stock</label>
                  <input type="number" value={form.countInStock} onChange={e => setForm({ ...form, countInStock: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Features (comma-separated)</label>
                <input value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} placeholder="e.g. Waterproof, Lightweight, Durable" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary">
                {editing ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </div>
        )}

        {loading ? <div className="spinner" /> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id}>
                  <td><img src={p.image} alt="" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 4 }} /></td>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td>{p.category}</td>
                  <td>₹{p.price.toFixed(2)}</td>
                  <td>{p.countInStock}</td>
                  <td>
                    <button className="btn btn-sm btn-secondary" style={{ marginRight: 8 }} onClick={() => handleEdit(p)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
