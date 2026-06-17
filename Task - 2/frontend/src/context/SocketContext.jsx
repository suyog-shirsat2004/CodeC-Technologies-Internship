import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const s = io(API, {
        query: { userId: user._id },
        transports: ['websocket', 'polling'],
      });
      setSocket(s);

      s.on('notification', (data) => {
        setNotifications(prev => [data, ...prev]);
      });

      return () => { s.disconnect(); };
    } else {
      if (socket) { socket.disconnect(); setSocket(null); }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, notifications, setNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};
