import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import Recommendations from '../components/Recommendations';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || '';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    axios.get(`${API}/api/products/categories`)
      .then(({ data }) => {
        setCategories(data);
        setTotalProducts(data.reduce((sum, c) => sum + c.count, 0));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: '12', sort });
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    axios.get(`${API}/api/products?${params}`)
      .then(({ data }) => {
        setProducts(data.products);
        setPages(data.pages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, category, sort, page]);

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Discover Products</h1>
          <p>Find the best products at great prices</p>
        </div>
      </div>

      <div className="container">
        <div className="search-bar">
          <input
            placeholder="Search products..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
            <option value="">All Categories ({totalProducts})</option>
            {categories.map(c => <option key={c.name} value={c.name}>{c.name} ({c.count})</option>)}
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {user && <Recommendations type="personalized" />}
        <Recommendations type="trending" />

        <h2 style={{ marginBottom: 20, marginTop: user ? 0 : 40 }}>
          {search ? `Search: "${search}"` : category || 'All Products'}
        </h2>

        {loading ? (
          <div className="spinner" />
        ) : products.length === 0 ? (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Try adjusting your search or filters</p>
            {(search || category) && (
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => { setSearch(''); setCategory(''); setPage(1); }}>
                Show All Products
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-4">
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
            {pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                {Array.from({ length: pages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
