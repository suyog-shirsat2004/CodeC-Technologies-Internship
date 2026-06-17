import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import Recommendations from '../components/Recommendations';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '';

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [imgError, setImgError] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/api/products/${id}`)
      .then(({ data }) => setProduct(data))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner" />;
  if (!product) return <div className="empty-state"><h3>Product not found</h3></div>;

  return (
    <>
      <div className="container">
        <div className="product-detail">
          <div className="image-section">
            {imgError ? (
              <div className="img-placeholder" style={{ height: 400, borderRadius: 12, background: '#f8f9fa' }}>
                <i className="fas fa-image" />
              </div>
            ) : (
              <img src={product.image} alt={product.name} onError={() => setImgError(true)} />
            )}
          </div>
          <div className="info-section">
            <p className="meta">{product.category} {product.brand && `| ${product.brand}`}</p>
            <h1>{product.name}</h1>
            <p className="rating">
              {'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}
              {' '}({product.numReviews} reviews)
            </p>
            <p className="price-lg">₹{product.price.toFixed(2)}</p>
            <p className="description">{product.description}</p>
            {product.features?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p className="meta" style={{ fontWeight: 600, marginBottom: 4 }}>Features:</p>
                <ul style={{ paddingLeft: 20, color: '#555' }}>
                  {product.features.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            )}
            <p className={`stock ${product.countInStock > 0 ? 'in-stock' : 'out-of-stock'}`} style={{ fontWeight: 600 }}>
              {product.countInStock > 0 ? `${product.countInStock} in stock` : 'Out of Stock'}
            </p>
            {product.countInStock > 0 && (
              <div className="quantity-selector">
                <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                <span>{qty}</span>
                <button onClick={() => setQty(Math.min(product.countInStock, qty + 1))}>+</button>
                <button
                  className="btn btn-primary"
                  onClick={() => { addToCart(product, qty); toast.success('Added to cart'); }}
                >
                  Add to Cart
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Recommendations type="similar" productId={id} />
    </>
  );
}
