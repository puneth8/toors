// ============================================
// Flight Routes
// ============================================
const express = require('express');
const router = express.Router();
const { searchFlights, getFlightById, getAllFlights, createFlight, deleteFlight } = require('../controllers/flightController');

router.get('/search', searchFlights);
router.get('/:id', getFlightById);
router.get('/', getAllFlights);
router.post('/', createFlight);
router.delete('/:id', deleteFlight);

module.exports = router;
