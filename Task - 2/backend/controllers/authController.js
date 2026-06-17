const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

exports.register = async (req, res) => {
  try {
    const { username, email, password, name } = req.body;
    if (await User.findOne({ $or: [{ email }, { username }] })) {
      return res.status(400).json({ message: 'User or email already exists' });
    }
    const user = await User.create({ username, email, password, name });
    res.status(201).json({
      _id: user._id, username: user.username, email: user.email,
      name: user.name, avatar: user.avatar, bio: user.bio,
      followers: user.followers, following: user.following,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id, username: user.username, email: user.email,
        name: user.name, avatar: user.avatar, bio: user.bio,
        followers: user.followers, following: user.following,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
