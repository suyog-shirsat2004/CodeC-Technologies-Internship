import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import AuthModal from './AuthModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) return null;

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="logo">ShopHub</Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/cart">
            Cart
            {cartItems.length > 0 && <span className="cart-badge">{cartItems.length}</span>}
          </Link>
          {user ? (
            <>
              {user.isAdmin && <Link to="/admin">Admin</Link>}
              <button onClick={logout}>Logout ({user.name})</button>
            </>
          ) : (
            <AuthModal />
          )}
        </div>
      </div>
    </nav>
  );
}
