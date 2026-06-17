import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';

  if (!user || isAuthPage) return null;

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="logo">SocialHub</Link>
        <div className="nav-links">
          <Link to="/" className={isActive('/')}><i className="fas fa-home" /> Home</Link>
          <Link to="/messages" className={isActive('/messages')}><i className="fas fa-envelope" /> Messages</Link>
          <Link to="/notifications" className={isActive('/notifications')}><i className="fas fa-bell" /> Notifications</Link>
          <Link to="/analytics" className={isActive('/analytics')}><i className="fas fa-chart-bar" /> Analytics</Link>
          <Link to={`/profile/${user.username}`} className={isActive(`/profile/${user.username}`)}>
            <i className="fas fa-user" /> {user.name}
          </Link>
          <button onClick={logout}><i className="fas fa-sign-out-alt" /></button>
        </div>
      </div>
    </nav>
  );
}
