const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { publishNotification } = require('../socket/notifications');

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const messages = await Message.aggregate([
      { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', userId] },
              '$receiver',
              '$sender',
            ],
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: { $cond: [{ $and: [{ $eq: ['$receiver', userId] }, { $eq: ['$read', false] }] }, 1, 0] },
          },
        },
      },
      { $sort: { 'lastMessage.createdAt': -1 } },
    ]);

    const populated = await User.populate(messages, {
      path: '_id',
      select: 'username name avatar',
    });

    res.json(populated.map(m => ({
      user: m._id,
      lastMessage: m.lastMessage,
      unreadCount: m.unreadCount,
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    }).sort({ createdAt: 1 }).limit(100);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      text,
    });
    const populated = await Message.findById(message._id)
      .populate('sender', 'username name avatar')
      .populate('receiver', 'username name avatar');

    const notification = await Notification.create({
      user: receiverId,
      from: req.user._id,
      type: 'message',
      text: `sent you a message`,
    });

    publishNotification(receiverId.toString(), {
      type: 'message',
      from: { _id: req.user._id, username: req.user.username, name: req.user.name, avatar: req.user.avatar },
      text: `sent you a message`,
      message: populated,
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    await Message.updateMany(
      { sender: userId, receiver: req.user._id, read: false },
      { read: true }
    );
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
