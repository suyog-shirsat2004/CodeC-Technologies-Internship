const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Post = require('./models/Post');

dotenv.config();

const users = [
  { username: 'john_doe', email: 'john@example.com', password: 'password123', name: 'John Doe', bio: 'Software developer & coffee lover' },
  { username: 'jane_smith', email: 'jane@example.com', password: 'password123', name: 'Jane Smith', bio: 'Digital artist | Photographer' },
  { username: 'admin', email: 'admin@social.com', password: 'admin123', name: 'Admin User', bio: 'Platform admin', avatar: '' },
];

const posts = [
  { content: 'Just finished building an amazing project! The future is here 🚀', likes: [], comments: [] },
  { content: 'Beautiful sunset captured today during my hike 🌅', likes: [], comments: [] },
  { content: 'New blog post: 10 tips for better code quality. Check it out!', likes: [], comments: [] },
  { content: 'Excited to announce our new product launch next month! 🎉', likes: [], comments: [] },
  { content: 'Morning coffee and coding - the perfect combo ☕', likes: [], comments: [] },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Post.deleteMany({});
    console.log('Cleared existing data');

    const createdUsers = [];
    for (const u of users) {
      const user = await User.create(u);
      createdUsers.push(user);
    }
    console.log(`Created ${createdUsers.length} users`);

    for (let i = 0; i < posts.length; i++) {
      const user = createdUsers[i % createdUsers.length];
      const post = await Post.create({
        user: user._id,
        content: posts[i].content,
      });
      if (i > 0) {
        post.likes.push(createdUsers[(i + 1) % createdUsers.length]._id);
      }
      await post.save();
    }
    console.log(`Created ${posts.length} posts`);

    createdUsers[0].following.push(createdUsers[1]._id, createdUsers[2]._id);
    createdUsers[1].following.push(createdUsers[0]._id, createdUsers[2]._id);
    createdUsers[2].following.push(createdUsers[0]._id, createdUsers[1]._id);
    for (const u of createdUsers) await u.save();
    console.log('Set up follower relationships');

    console.log('\n--- Login Credentials ---');
    users.forEach(u => console.log(`  ${u.email} / ${u.password}`));

    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seed();
