// ============================================
// Route Routes (Bus Routes between cities)
// ============================================
const express = require('express');
const router = express.Router();
const { getAllRoutes, searchCities, createRoute, updateRoute, deleteRoute } = require('../controllers/routeController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getAllRoutes);
router.get('/cities', searchCities);

// Admin routes
router.post('/', protect, adminOnly, createRoute);
router.put('/:id', protect, adminOnly, updateRoute);
router.delete('/:id', protect, adminOnly, deleteRoute);

module.exports = router;
