import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || '';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [platform, setPlatform] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const [dashRes, platRes] = await Promise.all([
          axios.get(`${API}/api/analytics/dashboard`, config),
          axios.get(`${API}/api/analytics/platform`, config),
        ]);
        setData(dashRes.data);
        setPlatform(platRes.data);
      } catch { } finally { setLoading(false); }
    };
    fetch();
  }, [user]);

  if (loading) return <div className="spinner" />;
  if (!data) return <div className="empty-state"><h3>Failed to load analytics</h3></div>;

  const maxValue = Math.max(...data.engagementTimeline.map(d => d.likes + d.comments + d.posts), 1);

  return (
    <div className="container analytics-page">
      <h1 style={{ marginBottom: 24 }}>Analytics Dashboard</h1>

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <div className="card stat-card">
          <div className="stat-icon" style={{ color: '#6c63ff' }}><i className="fas fa-file-alt" /></div>
          <div className="stat-num">{data.totalPosts}</div>
          <div className="stat-label">Total Posts</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ color: '#e94560' }}><i className="fas fa-heart" /></div>
          <div className="stat-num">{data.totalLikes}</div>
          <div className="stat-label">Total Likes</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ color: '#f39c12' }}><i className="fas fa-comment" /></div>
          <div className="stat-num">{data.totalComments}</div>
          <div className="stat-label">Total Comments</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ color: '#27ae60' }}><i className="fas fa-users" /></div>
          <div className="stat-num">{data.totalFollowers}</div>
          <div className="stat-label">Followers</div>
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 8 }}>30-Day Engagement Trend</h3>
        <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: 16 }}>Likes, comments, and posts over the last 30 days</p>
        <div className="chart-bar">
          {data.engagementTimeline.map((d, i) => {
            const val = d.likes + d.comments + d.posts;
            const height = (val / maxValue) * 100;
            return (
              <div key={i} className="bar" style={{ height: `${Math.max(height, 2)}%` }} title={`${d.date}: ${val} engagements`} />
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.7rem', color: '#aaa' }}>
          <span>{data.engagementTimeline[0]?.date?.slice(5)}</span>
          <span>{data.engagementTimeline[data.engagementTimeline.length - 1]?.date?.slice(5)}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Top Posts</h3>
          {data.topPosts?.length === 0 ? (
            <p style={{ color: '#888' }}>No posts yet</p>
          ) : (
            data.topPosts?.map((p, i) => (
              <div key={p._id} style={{ padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <div style={{ fontSize: '0.9rem', marginBottom: 4 }}>#{i + 1} {p.content?.slice(0, 60)}...</div>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>
                  <i className="fas fa-heart" style={{ color: '#e94560' }} /> {p.likes?.length || 0}
                  {' '}<i className="fas fa-comment" style={{ color: '#6c63ff' }} /> {p.comments?.length || 0}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Platform Stats</h3>
          {platform && (
            <>
              <div style={{ padding: '12px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Users</span><span style={{ fontWeight: 700 }}>{platform.totalUsers}</span>
              </div>
              <div style={{ padding: '12px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Posts</span><span style={{ fontWeight: 700 }}>{platform.totalPosts}</span>
              </div>
              <div style={{ padding: '12px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Messages</span><span style={{ fontWeight: 700 }}>{platform.totalMessages}</span>
              </div>
              <div style={{ padding: '12px 0', display: 'flex', justifyContent: 'space-between' }}>
                <span>Weekly Active Users</span><span style={{ fontWeight: 700 }}>{platform.weeklyActiveUsers}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
