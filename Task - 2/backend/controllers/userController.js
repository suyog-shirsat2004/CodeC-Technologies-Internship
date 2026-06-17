const User = require('../models/User');
const Post = require('../models/Post');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 }).limit(20)
      .populate('user', 'username name avatar');

    const isFollowing = req.user ? user.followers.includes(req.user._id) : false;

    res.json({ user, posts, isFollowing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (req.files?.avatar) user.avatar = `/uploads/${req.files.avatar[0].filename}`;
    if (req.files?.coverPhoto) user.coverPhoto = `/uploads/${req.files.coverPhoto[0].filename}`;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.followUser = async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (target._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const alreadyFollowing = target.followers.includes(req.user._id);
    if (alreadyFollowing) {
      target.followers.pull(req.user._id);
      req.user.following.pull(target._id);
    } else {
      target.followers.push(req.user._id);
      req.user.following.push(target._id);
    }
    await target.save();
    await req.user.save();

    res.json({
      following: !alreadyFollowing,
      followersCount: target.followers.length,
      followingCount: req.user.following.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
      ],
    }).select('username name avatar').limit(10);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
