// ============================================
// Flight Controller - Search and CRUD
// ============================================
const Flight = require('../models/Flight');
const Route = require('../models/Route');

// @desc    Search flights between two cities
// @route   GET /api/flights/search?source=X&destination=Y&date=Z
exports.searchFlights = async (req, res) => {
  try {
    const { source, destination } = req.query;
    if (!source || !destination) {
      return res.status(400).json({ success: false, message: 'Source and destination are required' });
    }

    const routes = await Route.find({
      $or: [
        { source: new RegExp(source, 'i'), destination: new RegExp(destination, 'i') },
        { source: new RegExp(destination, 'i'), destination: new RegExp(source, 'i') }
      ],
      isActive: true
    });

    if (routes.length === 0) return res.json({ success: true, flights: [] });

    const routeIds = routes.map(r => r._id);
    let flights = await Flight.find({ route: { $in: routeIds }, isActive: true }).populate('route');

    const flightsWithPricing = flights.map(flight => {
      const cheapestClass = flight.classes?.reduce((min, cls) =>
        cls.price < min.price ? cls : min, flight.classes[0]);

      return {
        ...flight.toObject(),
        cheapestPrice: cheapestClass?.price || 0,
        isBestPrice: false
      };
    });

    if (flightsWithPricing.length > 0) {
      const minPrice = Math.min(...flightsWithPricing.map(f => f.cheapestPrice));
      flightsWithPricing.forEach(f => { if (f.cheapestPrice === minPrice) f.isBestPrice = true; });
    }

    res.json({ success: true, flights: flightsWithPricing, count: flightsWithPricing.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get flight by ID
// @route   GET /api/flights/:id
exports.getFlightById = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id).populate('route');
    if (!flight) return res.status(404).json({ success: false, message: 'Flight not found' });
    res.json({ success: true, flight });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all flights (Admin)
exports.getAllFlights = async (req, res) => {
  try {
    const flights = await Flight.find().populate('route').sort('-createdAt');
    res.json({ success: true, flights });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create flight (Admin)
exports.createFlight = async (req, res) => {
  try {
    const flight = await Flight.create(req.body);
    const populated = await flight.populate('route');
    res.status(201).json({ success: true, flight: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete flight (Admin)
exports.deleteFlight = async (req, res) => {
  try {
    await Flight.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Flight deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
