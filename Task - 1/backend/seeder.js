const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');

dotenv.config();

const products = [
  {
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and ultra-comfortable ear cushions. Features Bluetooth 5.2 and high-resolution audio support.',
    price: 299.99,
    category: 'Electronics',
    brand: 'SoundPro',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    countInStock: 25,
    rating: 4.5,
    numReviews: 128,
    features: ['Noise Cancelling', 'Bluetooth 5.2', '30hr Battery', 'Hi-Res Audio'],
  },
  {
    name: 'Organic Cotton T-Shirt',
    description: 'Soft, breathable organic cotton t-shirt with a modern fit. Perfect for everyday wear. Available in multiple colors. Pre-shrunk fabric.',
    price: 34.99,
    category: 'Clothing',
    brand: 'EcoWear',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    countInStock: 150,
    rating: 4.2,
    numReviews: 89,
    features: ['Organic Cotton', 'Pre-shrunk', 'Machine Washable', 'Modern Fit'],
  },
  {
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracker with GPS, heart rate monitoring, sleep tracking, and 7-day battery life. Water resistant to 50 meters.',
    price: 199.99,
    category: 'Electronics',
    brand: 'TechFit',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    countInStock: 60,
    rating: 4.7,
    numReviews: 245,
    features: ['GPS', 'Heart Rate Monitor', 'Sleep Tracking', 'Water Resistant'],
  },
  {
    name: 'Leather Messenger Bag',
    description: 'Handcrafted genuine leather messenger bag with padded laptop compartment, multiple organizer pockets, and adjustable shoulder strap.',
    price: 149.99,
    category: 'Accessories',
    brand: 'LeatherCraft',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
    countInStock: 35,
    rating: 4.6,
    numReviews: 67,
    features: ['Genuine Leather', 'Padded Laptop Compartment', 'Adjustable Strap', 'Multiple Pockets'],
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Double-wall vacuum insulated water bottle keeps drinks cold for 24 hours or hot for 12 hours. BPA-free, eco-friendly design.',
    price: 29.99,
    category: 'Home & Lifestyle',
    brand: 'EcoWare',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
    countInStock: 200,
    rating: 4.4,
    numReviews: 312,
    features: ['Vacuum Insulated', 'BPA-Free', '24hr Cold', '12hr Hot'],
  },
  {
    name: 'Ergonomic Office Chair',
    description: 'Premium ergonomic mesh chair with lumbar support, adjustable armrests, and breathable backrest. Designed for all-day comfort.',
    price: 449.99,
    category: 'Furniture',
    brand: 'ComfortPlus',
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400',
    countInStock: 15,
    rating: 4.8,
    numReviews: 94,
    features: ['Lumbar Support', 'Adjustable Armrests', 'Mesh Backrest', 'Breathable'],
  },
  {
    name: 'Professional Chef Knife Set',
    description: 'German stainless steel knife set with 5 essential kitchen knives. Ergonomic handles, precision-honed blades, includes storage block.',
    price: 179.99,
    category: 'Home & Lifestyle',
    brand: 'BladeMaster',
    image: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=400',
    countInStock: 40,
    rating: 4.6,
    numReviews: 156,
    features: ['German Steel', 'Ergonomic Handle', 'Dishwasher Safe', 'Storage Block'],
  },
  {
    name: 'Running Shoes Ultra',
    description: 'Lightweight performance running shoes with responsive cushioning and breathable mesh upper. Carbon plate technology for maximum energy return.',
    price: 159.99,
    category: 'Clothing',
    brand: 'SpeedFlex',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    countInStock: 80,
    rating: 4.5,
    numReviews: 203,
    features: ['Carbon Plate', 'Breathable Mesh', 'Responsive Cushioning', 'Lightweight'],
  },
  {
    name: 'Minimalist Desk Lamp',
    description: 'LED desk lamp with adjustable color temperature, brightness levels, and built-in wireless charging base. Touch controls.',
    price: 79.99,
    category: 'Furniture',
    brand: 'LumiTech',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
    countInStock: 55,
    rating: 4.3,
    numReviews: 78,
    features: ['Adjustable Brightness', 'Wireless Charging', 'Touch Controls', 'LED'],
  },
  {
    name: 'Classic Denim Jacket',
    description: 'Timeless denim jacket in medium wash. Button-front closure, chest pockets, and adjustable waist tabs. A wardrobe essential.',
    price: 89.99,
    category: 'Clothing',
    brand: 'DenimCo',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400',
    countInStock: 45,
    rating: 4.1,
    numReviews: 112,
    features: ['Button Front', 'Chest Pockets', 'Adjustable Waist', 'Classic Fit'],
  },
  {
    name: 'Wireless Charging Pad',
    description: 'Fast wireless charger compatible with all Qi-enabled devices. Slim design with LED indicator and foreign object detection.',
    price: 24.99,
    category: 'Electronics',
    brand: 'TechFit',
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
    countInStock: 120,
    rating: 4.0,
    numReviews: 45,
    features: ['Qi Compatible', 'Fast Charging', 'LED Indicator', 'Slim Design'],
  },
  {
    name: 'Leather Wallet RFID',
    description: 'Slim bifold leather wallet with RFID blocking technology. 6 card slots, bill compartment, and coin pocket. Gift box included.',
    price: 49.99,
    category: 'Accessories',
    brand: 'LeatherCraft',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400',
    countInStock: 90,
    rating: 4.5,
    numReviews: 178,
    features: ['RFID Blocking', 'Genuine Leather', 'Slim Design', 'Gift Box'],
  },
  {
    name: 'Bluetooth Portable Speaker',
    description: 'Waterproof portable speaker with 360-degree sound, 20-hour battery, and built-in microphone. Perfect for outdoor adventures.',
    price: 79.99,
    category: 'Electronics',
    brand: 'SoundPro',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
    countInStock: 70,
    rating: 4.3,
    numReviews: 198,
    features: ['Waterproof', '360 Sound', '20hr Battery', 'Built-in Mic'],
  },
  {
    name: 'Yoga Mat Premium',
    description: 'Extra thick, non-slip yoga mat with alignment lines. Made from eco-friendly TPE material. Includes carrying strap.',
    price: 44.99,
    category: 'Sports & Outdoors',
    brand: 'FlexFit',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
    countInStock: 65,
    rating: 4.4,
    numReviews: 134,
    features: ['Non-Slip', 'Extra Thick', 'Eco-Friendly', 'Carrying Strap'],
  },
  {
    name: 'Sunglasses Aviator',
    description: 'Classic aviator sunglasses with polarized UV400 lenses. Lightweight metal frame with adjustable nose pads. Includes case.',
    price: 129.99,
    category: 'Accessories',
    brand: 'Vista',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',
    countInStock: 50,
    rating: 4.6,
    numReviews: 88,
    features: ['Polarized', 'UV400 Protection', 'Lightweight', 'Hard Case'],
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Product.deleteMany({});
    console.log('Cleared existing products');

    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'admin123',
        isAdmin: true,
      });
      console.log('Created admin user (admin@example.com / admin123)');
    }

    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products`);

    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seed();
