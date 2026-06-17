import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || '';

export default function UserSearch() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    const q = e.target.value;
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    try {
      const { data } = await axios.get(`${API}/api/users/search?q=${q}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setResults(data);
    } catch { setResults([]); }
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        value={query}
        onChange={handleSearch}
        placeholder="Search users..."
        style={{
          width: '100%', padding: '8px 14px', border: '1px solid #ddd',
          borderRadius: 20, fontSize: '0.9rem', outline: 'none',
        }}
      />
      {results.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: '#fff', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          zIndex: 10, marginTop: 4,
        }}>
          {results.map(u => (
            <Link
              key={u._id}
              to={`/profile/${u.username}`}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid #eee' }}
              onClick={() => { setQuery(''); setResults([]); }}
            >
              <img
                src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}&background=6c63ff&color=fff`}
                alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{u.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>@{u.username}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
