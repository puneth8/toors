// ============================================
// Admin Routes
// ============================================
const express = require('express');
const router = express.Router();
const { getDashboard, getAllUsers, toggleBlockUser, getAllBookings } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly); // All admin routes require admin auth

router.get('/dashboard', getDashboard);
router.get('/users', getAllUsers);
router.put('/users/:id/block', toggleBlockUser);
router.get('/bookings', getAllBookings);

module.exports = router;
