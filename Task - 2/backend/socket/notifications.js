const redis = require('../config/redis');

const userSockets = new Map();

function setUserSocket(userId, socketId) {
  userSockets.set(userId.toString(), socketId);
}

function removeUserSocket(socketId) {
  for (const [userId, sid] of userSockets.entries()) {
    if (sid === socketId) {
      userSockets.delete(userId);
      break;
    }
  }
}

function getSocketId(userId) {
  return userSockets.get(userId.toString());
}

async function publishNotification(userId, notification) {
  const io = require('../server').getIO();
  const socketId = getSocketId(userId);
  if (socketId) {
    io.to(socketId).emit('notification', notification);
  }

  if (redis) {
    try {
      const key = `unread:${userId}`;
      await redis.incr(key);
      await redis.expire(key, 7 * 24 * 60 * 60);
    } catch { }
  }
}

function setupSocket(io) {
  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      setUserSocket(userId, socket.id);
      console.log(`User ${userId} connected (socket: ${socket.id})`);
    }

    socket.on('join_conversation', ({ userId: otherUserId }) => {
      const room = [userId, otherUserId].sort().join('_');
      socket.join(room);
    });

    socket.on('send_message', (data) => {
      const room = [userId, data.receiverId].sort().join('_');
      io.to(room).emit('new_message', data);
    });

    socket.on('typing', ({ receiverId, isTyping }) => {
      const receiverSocketId = getSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing', { userId, isTyping });
      }
    });

    socket.on('disconnect', () => {
      removeUserSocket(socket.id);
      console.log(`Socket ${socket.id} disconnected`);
    });
  });
}

module.exports = { setupSocket, publishNotification };
