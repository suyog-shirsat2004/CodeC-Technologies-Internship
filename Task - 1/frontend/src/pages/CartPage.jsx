import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQty, itemsPrice, shippingPrice, taxPrice, totalPrice } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="container cart-page">
        <div className="empty-state">
          <h3>Your cart is empty</h3>
          <p>Add some products to get started</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <h1>Shopping Cart ({cartItems.length} items)</h1>
      {cartItems.map(item => (
        <div key={item._id} className="cart-item">
          <Link to={`/product/${item._id}`}>
            <img src={item.image} alt={item.name} />
          </Link>
          <div>
            <Link to={`/product/${item._id}`} className="item-name">{item.name}</Link>
            <p style={{ color: '#888', fontSize: '0.85rem' }}>{item.category}</p>
          </div>
          <div className="item-price">₹{(item.price * item.qty).toFixed(2)}</div>
          <div className="qty-controls">
            <button onClick={() => updateQty(item._id, item.qty - 1)}>-</button>
            <span style={{ fontWeight: 600, minWidth: 24, textAlign: 'center' }}>{item.qty}</span>
            <button onClick={() => updateQty(item._id, item.qty + 1)}>+</button>
          </div>
          <button className="remove-btn" onClick={() => removeFromCart(item._id)}>×</button>
        </div>
      ))}
      <div className="cart-summary">
        <h3>Order Summary</h3>
        <div className="row"><span>Items</span><span>₹{itemsPrice.toFixed(2)}</span></div>
        <div className="row"><span>Shipping</span><span>{shippingPrice === 0 ? 'FREE' : `₹${shippingPrice.toFixed(2)}`}</span></div>
        <div className="row"><span>Tax (8%)</span><span>₹{taxPrice.toFixed(2)}</span></div>
        <div className="row total"><span>Total</span><span>₹{totalPrice.toFixed(2)}</span></div>
        <Link to="/checkout" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
