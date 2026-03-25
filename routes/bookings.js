// ============================================
// Booking Routes
// ============================================
const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getBooking, cancelBooking, downloadTicketPDF, getSmartSuggestions } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.use(protect); // All booking routes require auth

router.post('/', createBooking);
router.get('/my', getMyBookings);
router.get('/suggestions', getSmartSuggestions);
router.get('/:id', getBooking);
router.put('/:id/cancel', cancelBooking);
router.get('/:id/pdf', downloadTicketPDF);

module.exports = router;
