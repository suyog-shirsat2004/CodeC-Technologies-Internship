import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ProductCard from './ProductCard';

const API = import.meta.env.VITE_API_URL || '';

export default function Recommendations({ type = 'personalized', productId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const config = user?.token ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
        let url;
        if (type === 'personalized' && user) {
          url = `${API}/api/recommendations/`;
        } else if (type === 'similar' && productId) {
          url = `${API}/api/recommendations/similar/${productId}`;
        } else {
          url = `${API}/api/recommendations/trending`;
        }
        const { data } = await axios.get(url, config);
        setProducts(data);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [type, productId, user]);

  if (loading) return <div className="spinner" />;
  if (products.length === 0) return null;

  const title = type === 'similar' ? 'Similar Products' :
    type === 'personalized' ? 'Recommended for You' : 'Trending Products';

  return (
    <div className="recommendations">
      <div className="container">
        <h2>{title}</h2>
        <div className="grid grid-4">
          {products.map(p => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
