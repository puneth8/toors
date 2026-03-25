// ============================================
// Bus Routes
// ============================================
const express = require('express');
const router = express.Router();
const { searchBuses, getBusDetails, getAllBuses, createBus, updateBus, deleteBus } = require('../controllers/busController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/search', searchBuses);
router.get('/:id', getBusDetails);

// Admin routes
router.get('/', protect, adminOnly, getAllBuses);
router.post('/', protect, adminOnly, createBus);
router.put('/:id', protect, adminOnly, updateBus);
router.delete('/:id', protect, adminOnly, deleteBus);

module.exports = router;
