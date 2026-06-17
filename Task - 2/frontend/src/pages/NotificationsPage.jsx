import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '';

export default function NotificationsPage() {
  const { user } = useAuth();
  const { notifications, setNotifications } = useSocket();
  const [dbNotifications, setDbNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/notifications`, {
      headers: { Authorization: `Bearer ${user.token}` },
    }).then(({ data }) => setDbNotifications(data.notifications))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    try {
      await axios.put(`${API}/api/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setDbNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All marked as read');
    } catch { toast.error('Failed'); }
  };

  const handleMarkRead = async (id) => {
    try {
      await axios.put(`${API}/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setDbNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch { }
  };

  const combined = [
    ...notifications.map(n => ({ ...n, isLive: true })),
    ...dbNotifications.filter(n => !notifications.some(l => l._id === n._id)),
  ];

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const getIcon = (type) => {
    switch (type) {
      case 'like': return 'fa-heart';
      case 'comment': return 'fa-comment';
      case 'follow': return 'fa-user-plus';
      case 'message': return 'fa-envelope';
      default: return 'fa-bell';
    }
  };

  const getLink = (n) => {
    if (n.type === 'message') return '/messages';
    if (n.post) return `/`;
    return `/profile/${n.from?.username}`;
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className="container" style={{ padding: '24px 0', maxWidth: 700, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>Notifications</h1>
        <button className="btn btn-sm btn-secondary" onClick={markAllRead}>Mark All Read</button>
      </div>

      {combined.length === 0 ? (
        <div className="empty-state">
          <h3>No notifications</h3>
          <p>You're all caught up!</p>
        </div>
      ) : (
        combined.map((n, i) => (
          <Link
            key={n._id || i}
            to={getLink(n)}
            onClick={() => n._id && handleMarkRead(n._id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
              background: n.read && !n.isLive ? '#fff' : '#f0f2ff',
              borderRadius: 12, marginBottom: 8, transition: 'background 0.2s',
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: '#eef0ff', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#6c63ff', fontSize: '1.1rem',
            }}>
              <i className={`fas ${getIcon(n.type)}`} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.9rem' }}>
                <strong>{n.from?.name || 'Someone'}</strong> {n.text || 'interacted with you'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#888', marginTop: 2 }}>
                {timeAgo(n.createdAt)}
              </div>
            </div>
            {!n.read && !n.isLive && (
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6c63ff' }} />
            )}
          </Link>
        ))
      )}
    </div>
  );
}
