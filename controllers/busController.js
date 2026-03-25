// ============================================
// Bus Controller - Search, Details, CRUD
// ============================================
const Bus = require('../models/Bus');
const Booking = require('../models/Booking');
const Route = require('../models/Route');

// @desc    Search buses between two cities
// @route   GET /api/buses/search?source=X&destination=Y&date=Z&type=W
exports.searchBuses = async (req, res) => {
  try {
    const { source, destination, date, type } = req.query;

    if (!source || !destination) {
      return res.status(400).json({ success: false, message: 'Source and destination are required' });
    }

    // Find routes in BOTH directions
    const routes = await Route.find({
      $or: [
        { source: new RegExp(source, 'i'), destination: new RegExp(destination, 'i') },
        { source: new RegExp(destination, 'i'), destination: new RegExp(source, 'i') }
      ],
      isActive: true
    });

    if (routes.length === 0) {
      return res.json({ success: true, buses: [], message: 'No routes found' });
    }

    const routeIds = routes.map(r => r._id);

    // Build query
    let query = { route: { $in: routeIds }, isActive: true };
    if (type && type !== 'all') {
      query.busType = type;
    }

    let buses = await Bus.find(query).populate('route');

    // Get booked seats for the travel date
    const travelDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(travelDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(travelDate.setHours(23, 59, 59, 999));

    const busesWithAvailability = await Promise.all(buses.map(async (bus) => {
      const bookings = await Booking.find({
        bus: bus._id,
        travelDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $ne: 'cancelled' }
      });

      const bookedSeats = bookings.reduce((acc, b) => [...acc, ...b.seatNumbers], []);
      const availableSeats = bus.totalSeats - bookedSeats.length;

      // Determine if this is a reverse route match
      const matchedRoute = routes.find(r => r._id.toString() === bus.route._id.toString());
      const isReversed = matchedRoute && 
        matchedRoute.source.toLowerCase() !== source.toLowerCase();

      return {
        ...bus.toObject(),
        bookedSeats,
        availableSeats,
        isReversed,
        displaySource: isReversed ? bus.route.destination : bus.route.source,
        displayDestination: isReversed ? bus.route.source : bus.route.destination,
        // Smart price indicator
        isBestPrice: bus.price <= Math.min(...buses.filter(b => b.busType === bus.busType).map(b => b.price))
      };
    }));

    res.json({ success: true, buses: busesWithAvailability, count: busesWithAvailability.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single bus details with seat availability
// @route   GET /api/buses/:id?date=Z
exports.getBusDetails = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id).populate('route');
    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found' });
    }

    const date = req.query.date ? new Date(req.query.date) : new Date();
    const startOfDay = new Date(new Date(date).setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(date).setHours(23, 59, 59, 999));

    const bookings = await Booking.find({
      bus: bus._id,
      travelDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    });

    const bookedSeats = bookings.reduce((acc, b) => [...acc, ...b.seatNumbers], []);

    res.json({
      success: true,
      bus: {
        ...bus.toObject(),
        bookedSeats,
        availableSeats: bus.totalSeats - bookedSeats.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all buses (Admin)
// @route   GET /api/buses
exports.getAllBuses = async (req, res) => {
  try {
    const buses = await Bus.find().populate('route').sort('-createdAt');
    res.json({ success: true, buses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create bus (Admin)
// @route   POST /api/buses
exports.createBus = async (req, res) => {
  try {
    const bus = await Bus.create(req.body);
    const populated = await bus.populate('route');
    res.status(201).json({ success: true, bus: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update bus (Admin)
// @route   PUT /api/buses/:id
exports.updateBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    }).populate('route');

    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });
    res.json({ success: true, bus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete bus (Admin)
// @route   DELETE /api/buses/:id
exports.deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });
    res.json({ success: true, message: 'Bus deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
