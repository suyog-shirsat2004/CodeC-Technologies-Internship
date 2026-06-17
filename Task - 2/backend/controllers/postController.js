const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { publishNotification } = require('../socket/notifications');
const User = require('../models/User');

exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const media = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    const post = await Post.create({ user: req.user._id, content, media });
    const populated = await Post.findById(post._id).populate('user', 'username name avatar');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const user = await User.findById(req.user._id);
    const following = [...user.following, req.user._id];
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Post.countDocuments({ user: { $in: following } });
    const posts = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('user', 'username name avatar')
      .populate('comments.user', 'username name avatar');
    res.json({ posts, page: Number(page), pages: Math.ceil(total / Number(limit)), total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const alreadyLiked = post.likes.includes(req.user._id);
    if (alreadyLiked) {
      post.likes.pull(req.user._id);
    } else {
      post.likes.push(req.user._id);
      if (post.user.toString() !== req.user._id.toString()) {
        await Notification.create({
          user: post.user,
          from: req.user._id,
          type: 'like',
          post: post._id,
          text: 'liked your post',
        });
        publishNotification(post.user.toString(), {
          type: 'like',
          from: { _id: req.user._id, username: req.user.username, name: req.user.name, avatar: req.user.avatar },
          post: post._id,
          text: 'liked your post',
        });
      }
    }
    await post.save();
    res.json({ likes: post.likes, liked: !alreadyLiked, likesCount: post.likes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.commentPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = { user: req.user._id, text: req.body.text };
    post.comments.push(comment);
    await post.save();

    const populated = await Post.findById(post._id)
      .populate('user', 'username name avatar')
      .populate('comments.user', 'username name avatar');

    if (post.user.toString() !== req.user._id.toString()) {
      await Notification.create({
        user: post.user,
        from: req.user._id,
        type: 'comment',
        post: post._id,
        text: `commented: "${req.body.text.slice(0, 50)}"`,
      });
      publishNotification(post.user.toString(), {
        type: 'comment',
        from: { _id: req.user._id, username: req.user.username, name: req.user.name, avatar: req.user.avatar },
        post: post._id,
        text: `commented on your post`,
      });
    }

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
