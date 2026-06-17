import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [imgError, setImgError] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="card product-card">
      <Link to={`/product/${product._id}`}>
        <div className="image-wrap">
          {imgError ? (
            <div className="img-placeholder">
              <i className="fas fa-image" />
            </div>
          ) : (
            <img src={product.image} alt={product.name} onError={() => setImgError(true)} />
          )}
        </div>
      </Link>
      <div className="info">
        <p className="category">{product.category}</p>
        <Link to={`/product/${product._id}`}><h3>{product.name}</h3></Link>
        <p className="rating">{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))} ({product.numReviews})</p>
        <p className="price">₹{product.price.toFixed(2)}</p>
        <p className={`stock ${product.countInStock > 0 ? 'in-stock' : 'out-of-stock'}`}>
          {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
        </p>
        <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={product.countInStock === 0}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}
