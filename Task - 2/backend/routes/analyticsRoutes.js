const express = require('express');
const router = express.Router();
const { getDashboardAnalytics, getPlatformStats } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect, getDashboardAnalytics);
router.get('/platform', protect, getPlatformStats);

module.exports = router;
