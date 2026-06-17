import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const API = import.meta.env.VITE_API_URL || '';

export default function NotificationBell() {
  const { user } = useAuth();
  const { notifications } = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      axios.get(`${API}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${user.token}` },
      }).then(({ data }) => setUnreadCount(data.count)).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    setUnreadCount(prev => prev + 1);
  }, [notifications.length]);

  return (
    <Link to="/notifications" className="nav-icon">
      <i className="fas fa-bell" />
      {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
    </Link>
  );
}
