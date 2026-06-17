const express = require('express');
const router = express.Router();
const { getRecommendations, getTrendingProducts, getSimilarProducts } = require('../controllers/recommendationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getRecommendations);
router.get('/trending', getTrendingProducts);
router.get('/similar/:id', getSimilarProducts);

module.exports = router;
