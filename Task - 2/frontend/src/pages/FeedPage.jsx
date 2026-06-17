import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import UserSearch from '../components/UserSearch';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || '';

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchFeed = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/posts/feed?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (page === 1) {
        setPosts(data.posts);
      } else {
        setPosts(prev => [...prev, ...data.posts]);
      }
      setHasMore(page < data.pages);
    } catch { } finally { setLoading(false); }
  }, [page, user]);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  const handlePostCreated = (post) => {
    setPosts(prev => [post, ...prev]);
  };

  const handlePostUpdate = (updatedPost) => {
    if (updatedPost === null) {
      setPosts(prev => prev.filter(p => p._id !== updatedPost?._id));
    } else {
      setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
    }
  };

  return (
    <div className="container">
      <div className="feed-layout">
        <div className="sidebar">
          <div className="card sidebar-card">
            <h3>Welcome, {user.name}</h3>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>@{user.username}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, textAlign: 'center' }}>
              <div><div style={{ fontWeight: 700 }}>{user.followers?.length || 0}</div><div style={{ fontSize: '0.75rem', color: '#888' }}>Followers</div></div>
              <div><div style={{ fontWeight: 700 }}>{user.following?.length || 0}</div><div style={{ fontSize: '0.75rem', color: '#888' }}>Following</div></div>
            </div>
          </div>
          <div className="card sidebar-card">
            <h3>Quick Links</h3>
            <Link to="/analytics" style={{ display: 'block', padding: '8px 0', color: '#6c63ff' }}>
              <i className="fas fa-chart-bar" /> Dashboard
            </Link>
            <Link to="/messages" style={{ display: 'block', padding: '8px 0', color: '#6c63ff' }}>
              <i className="fas fa-envelope" /> Messages
            </Link>
          </div>
        </div>

        <div>
          <CreatePost onPostCreated={handlePostCreated} />
          {loading ? <div className="spinner" /> : (
            <>
              {posts.length === 0 && (
                <div className="empty-state">
                  <h3>No posts in your feed</h3>
                  <p>Follow more users to see their posts here</p>
                </div>
              )}
              {posts.map(p => (
                <PostCard key={p._id} post={p} onUpdate={handlePostUpdate} />
              ))}
              {hasMore && (
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => setPage(p => p + 1)}>
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div>
          <div className="card sidebar-card">
            <h3>Search Users</h3>
            <UserSearch />
          </div>
        </div>
      </div>
    </div>
  );
}
