import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('social_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem('social_user'); }
    }
    setLoading(false);
  }, []);

  const register = async (data) => {
    const res = await axios.post(`${API}/api/auth/register`, data);
    localStorage.setItem('social_user', JSON.stringify(res.data));
    setUser(res.data);
    return res.data;
  };

  const login = async (email, password) => {
    const res = await axios.post(`${API}/api/auth/login`, { email, password });
    localStorage.setItem('social_user', JSON.stringify(res.data));
    setUser(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('social_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
