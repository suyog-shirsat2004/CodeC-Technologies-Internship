const Post = require('../models/Post');
const User = require('../models/User');
const Message = require('../models/Message');

exports.getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalPosts = await Post.countDocuments({ user: userId });
    const totalFollowers = req.user.followers.length;
    const totalFollowing = req.user.following.length;

    const posts = await Post.find({ user: userId });
    const totalLikes = posts.reduce((sum, p) => sum + p.likes.length, 0);
    const totalComments = posts.reduce((sum, p) => sum + p.comments.length, 0);

    const messagesSent = await Message.countDocuments({ sender: userId });

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentPosts = await Post.find({
      user: userId,
      createdAt: { $gte: thirtyDaysAgo },
    }).sort({ createdAt: 1 });

    const engagementByDay = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      engagementByDay[d.toISOString().split('T')[0]] = { likes: 0, comments: 0, posts: 0 };
    }
    recentPosts.forEach(p => {
      const day = p.createdAt.toISOString().split('T')[0];
      if (engagementByDay[day]) {
        engagementByDay[day].posts += 1;
        engagementByDay[day].likes += p.likes.length;
        engagementByDay[day].comments += p.comments.length;
      }
    });

    const engagementTimeline = Object.entries(engagementByDay).map(([date, data]) => ({ date, ...data }));

    const topPosts = await Post.find({ user: userId })
      .sort({ 'likes': -1 })
      .limit(5)
      .select('content likes comments createdAt');

    res.json({
      totalPosts, totalFollowers, totalFollowing,
      totalLikes, totalComments, messagesSent,
      engagementTimeline, topPosts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    const totalMessages = await Message.countDocuments();

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const activeUsers = await Post.distinct('user', { createdAt: { $gte: weekAgo } });

    res.json({
      totalUsers, totalPosts, totalMessages,
      weeklyActiveUsers: activeUsers.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
