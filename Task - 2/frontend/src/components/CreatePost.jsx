import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '';

export default function CreatePost({ onPostCreated }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      media.forEach(f => formData.append('media', f));
      const { data } = await axios.post(`${API}/api/posts`, formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setContent('');
      setMedia([]);
      toast.success('Post created!');
      if (onPostCreated) onPostCreated(data);
    } catch {
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card create-post">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={`What's on your mind, ${user?.name}?`}
        />
        <div className="post-footer">
          <div>
            <label style={{ cursor: 'pointer', color: '#6c63ff' }}>
              <i className="fas fa-image" /> Add Media
              <input type="file" multiple accept="image/*,video/*" onChange={e => setMedia([...e.target.files])} />
            </label>
            {media.length > 0 && <span style={{ marginLeft: 12, fontSize: '0.85rem', color: '#888' }}>{media.length} file(s)</span>}
          </div>
          <button type="submit" className="btn btn-primary btn-sm" disabled={loading || !content.trim()}>
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
