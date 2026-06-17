const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, getUsers } = require('../controllers/authController');
const { protect, admin } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/users', protect, admin, getUsers);

module.exports = router;
