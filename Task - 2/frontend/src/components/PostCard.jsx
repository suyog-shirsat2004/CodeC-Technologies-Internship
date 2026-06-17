import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '';

export default function PostCard({ post, onUpdate }) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  const isLiked = post.likes?.includes(user._id);

  const handleLike = async () => {
    try {
      const { data } = await axios.post(`${API}/api/posts/${post._id}/like`, {}, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (onUpdate) onUpdate({ ...post, likes: data.likes });
    } catch { toast.error('Failed to like post'); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const { data } = await axios.post(`${API}/api/posts/${post._id}/comment`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      if (onUpdate) onUpdate(data);
      setCommentText('');
    } catch { toast.error('Failed to comment'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await axios.delete(`${API}/api/posts/${post._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      toast.success('Post deleted');
      if (onUpdate) onUpdate(null);
    } catch { toast.error('Failed to delete'); }
  };

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

  return (
    <div className="card post-card">
      <div className="post-header">
        <Link to={`/profile/${post.user?.username}`}>
          <img src={post.user?.avatar || `https://ui-avatars.com/api/?name=${post.user?.name}&background=6c63ff&color=fff`} alt="" />
        </Link>
        <div>
          <Link to={`/profile/${post.user?.username}`} className="post-user">{post.user?.name}</Link>
          <div className="post-username">@{post.user?.username}</div>
        </div>
        <span className="post-time">{timeAgo(post.createdAt)}</span>
        {post.user?._id === user._id && (
          <button onClick={handleDelete} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}>
            <i className="fas fa-trash" />
          </button>
        )}
      </div>
      <div className="post-content">{post.content}</div>
      {post.media?.length > 0 && (
        <div className="post-media">
          {post.media.map((m, i) => (
            m.match(/\.(mp4|webm)$/) ?
              <video key={i} src={m} controls style={{ width: '100%', borderRadius: 8 }} /> :
              <img key={i} src={m} alt="" />
          ))}
        </div>
      )}
      <div className="post-actions">
        <button className={isLiked ? 'liked' : ''} onClick={handleLike}>
          <i className={`fas fa-heart`} /> {post.likes?.length || 0}
        </button>
        <button onClick={() => setShowComments(!showComments)}>
          <i className="fas fa-comment" /> {post.comments?.length || 0}
        </button>
      </div>
      {showComments && (
        <div className="comment-section">
          {post.comments?.map((c, i) => (
            <div key={i} className="comment">
              <img src={c.user?.avatar || `https://ui-avatars.com/api/?name=${c.user?.name}&background=6c63ff&color=fff`} alt="" />
              <div className="comment-text">
                <strong>{c.user?.name}</strong> {c.text}
              </div>
            </div>
          ))}
          <form className="comment-input" onSubmit={handleComment}>
            <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Write a comment..." />
            <button type="submit">Post</button>
          </form>
        </div>
      )}
    </div>
  );
}
