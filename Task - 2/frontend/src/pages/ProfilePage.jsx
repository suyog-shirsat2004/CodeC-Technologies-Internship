import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '';

export default function ProfilePage() {
  const { username } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${API}/api/users/${username}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setProfile(data.user);
      setPosts(data.posts);
      setIsFollowing(data.isFollowing);
    } catch { toast.error('User not found'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, [username]);

  const handleFollow = async () => {
    try {
      const { data } = await axios.post(`${API}/api/users/${profile._id}/follow`, {}, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setIsFollowing(data.following);
      setProfile(prev => ({
        ...prev,
        followers: data.following
          ? [...prev.followers, user._id]
          : prev.followers.filter(f => f !== user._id),
      }));
    } catch { toast.error('Failed to follow/unfollow'); }
  };

  const isOwnProfile = user.username === username;

  if (loading) return <div className="spinner" />;
  if (!profile) return <div className="empty-state"><h3>User not found</h3></div>;

  return (
    <div className="container profile-page">
      <div className="profile-cover">
        {profile.coverPhoto && <img src={profile.coverPhoto} alt="" />}
        <div className="profile-info">
          <img
            className="profile-avatar"
            src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.name}&background=6c63ff&color=fff&size=120`}
            alt=""
          />
          <div className="profile-details">
            <h1>{profile.name}</h1>
            <p>@{profile.username} {profile.bio && `| ${profile.bio}`}</p>
          </div>
        </div>
      </div>

      <div className="profile-stats">
        <div><div className="num">{posts.length}</div><div className="label">Posts</div></div>
        <div><div className="num">{profile.followers?.length || 0}</div><div className="label">Followers</div></div>
        <div><div className="num">{profile.following?.length || 0}</div><div className="label">Following</div></div>
        {!isOwnProfile && (
          <div>
            <button className={`btn ${isFollowing ? 'btn-following' : 'btn-follow'} btn-sm`} onClick={handleFollow}>
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        {posts.length === 0 ? (
          <div className="empty-state"><h3>No posts yet</h3></div>
        ) : (
          posts.map(p => <PostCard key={p._id} post={p} />)
        )}
      </div>
    </div>
  );
}
