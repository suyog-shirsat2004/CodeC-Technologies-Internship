import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '';

export default function MessagesPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    axios.get(`${API}/api/messages/conversations`, {
      headers: { Authorization: `Bearer ${user.token}` },
    }).then(({ data }) => setConversations(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new_message', (data) => {
        if (activeChat && (data.sender?._id === activeChat._id || data.receiver?._id === activeChat._id)) {
          setMessages(prev => [...prev, data]);
        }
        setConversations(prev => {
          const existing = prev.find(c => c.user?._id === data.sender?._id);
          if (existing) {
            return prev.map(c =>
              c.user?._id === data.sender?._id
                ? { ...c, lastMessage: data, unreadCount: c.unreadCount + 1 }
                : c
            );
          }
          return prev;
        });
      });
      return () => { socket.off('new_message'); };
    }
  }, [socket, activeChat]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const openChat = async (conv) => {
    setActiveChat(conv.user);
    const { data } = await axios.get(`${API}/api/messages/${conv.user._id}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    setMessages(data);
    await axios.put(`${API}/api/messages/${conv.user._id}/read`, {}, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    setConversations(prev => prev.map(c =>
      c.user?._id === conv.user._id ? { ...c, unreadCount: 0 } : c
    ));
    if (socket) {
      socket.emit('join_conversation', { userId: conv.user._id });
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeChat) return;
    try {
      const { data } = await axios.post(`${API}/api/messages`, {
        receiverId: activeChat._id, text,
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      setMessages(prev => [...prev, data]);
      if (socket) {
        socket.emit('send_message', data);
      }
      setText('');
    } catch { toast.error('Failed to send'); }
  };

  const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (loading) return <div className="spinner" />;

  return (
    <div className="messages-page">
      <div className="conversations-list">
        <h3>Messages</h3>
        {conversations.length === 0 ? (
          <div className="empty-state" style={{ padding: 40 }}>
            <h3>No conversations</h3>
            <p>Start messaging other users</p>
          </div>
        ) : (
          conversations.map(conv => (
            <div
              key={conv.user?._id}
              className={`conversation-item ${activeChat?._id === conv.user?._id ? 'active' : ''}`}
              onClick={() => openChat(conv)}
            >
              <img
                src={conv.user?.avatar || `https://ui-avatars.com/api/?name=${conv.user?.name}&background=6c63ff&color=fff`}
                alt=""
              />
              <div className="conv-info">
                <div className="conv-name">{conv.user?.name}</div>
                <div className="conv-last">{conv.lastMessage?.text || ''}</div>
              </div>
              {conv.unreadCount > 0 && <span className="unread-badge">{conv.unreadCount}</span>}
            </div>
          ))
        )}
      </div>

      <div className="chat-area">
        {activeChat ? (
          <>
            <div className="chat-header">
              <img
                src={activeChat.avatar || `https://ui-avatars.com/api/?name=${activeChat.name}&background=6c63ff&color=fff`}
                alt=""
              />
              {activeChat.name}
            </div>
            <div className="chat-messages">
              {messages.map((m, i) => (
                <div key={i} className={`chat-message ${m.sender?._id === user._id || m.sender === user._id ? 'sent' : 'received'}`}>
                  <div>{m.text}</div>
                  <div className="msg-time">{formatTime(m.createdAt)}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form className="chat-input" onSubmit={sendMessage}>
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Type a message..."
              />
              <button type="submit" className="btn btn-primary btn-sm">Send</button>
            </form>
          </>
        ) : (
          <div className="empty-state" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3>Select a conversation</h3>
            <p>Choose someone to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
