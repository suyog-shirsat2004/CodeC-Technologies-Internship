const Product = require('../models/Product');
const Order = require('../models/Order');

function calculateSimilarity(productA, productB) {
  let score = 0;
  if (productA.category === productB.category) score += 3;
  if (productA.brand === productB.brand && productA.brand) score += 2;
  const priceDiff = Math.abs(productA.price - productB.price);
  if (priceDiff < 10) score += 2;
  else if (priceDiff < 50) score += 1;
  const commonFeatures = productA.features?.filter(f => productB.features?.includes(f))?.length || 0;
  score += commonFeatures;
  return score;
}

exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId }).populate('items.product');
    const purchasedProductIds = new Set();
    const categoryCount = {};
    const brandCount = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.product) {
          purchasedProductIds.add(item.product._id.toString());
          const cat = item.product.category;
          categoryCount[cat] = (categoryCount[cat] || 0) + 1;
          if (item.product.brand) {
            brandCount[item.product.brand] = (brandCount[item.product.brand] || 0) + 1;
          }
        }
      });
    });

    const preferredCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0];

    const queryFilter = { _id: { $nin: [...purchasedProductIds] } };
    if (preferredCategory) queryFilter.category = preferredCategory;

    const candidateProducts = await Product.find(queryFilter).limit(50);

    const scored = candidateProducts.map(product => ({
      product,
      score: 0,
    }));

    if (purchasedProductIds.size > 0 && candidateProducts.length > 0) {
      const purchasedProducts = await Product.find({ _id: { $in: [...purchasedProductIds] } });
      purchasedProducts.forEach(purchased => {
        candidateProducts.forEach(candidate => {
          const idx = scored.findIndex(s => s.product._id.toString() === candidate._id.toString());
          if (idx !== -1) {
            scored[idx].score += calculateSimilarity(purchased, candidate);
          }
        });
      });
    }

    scored.sort((a, b) => b.score - a.score);
    const recommendations = scored.slice(0, 8).map(s => s.product);

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTrendingProducts = async (req, res) => {
  try {
    const trending = await Product.find().sort({ rating: -1, numReviews: -1 }).limit(8);
    res.json(trending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSimilarProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const similar = await Product.find({
      _id: { $ne: product._id },
      $or: [
        { category: product.category },
        { brand: product.brand },
        { features: { $in: product.features || [] } },
      ],
    }).limit(6);

    const scored = similar.map(p => ({
      product: p,
      score: calculateSimilarity(product, p),
    }));
    scored.sort((a, b) => b.score - a.score);
    res.json(scored.map(s => s.product));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
