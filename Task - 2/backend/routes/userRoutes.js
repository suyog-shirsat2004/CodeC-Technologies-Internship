const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, followUser, searchUsers } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/search', protect, searchUsers);
router.get('/:username', protect, getProfile);
router.put('/profile', protect, upload.fields([{ name: 'avatar' }, { name: 'coverPhoto' }]), updateProfile);
router.post('/:id/follow', protect, followUser);

module.exports = router;
