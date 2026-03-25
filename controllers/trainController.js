// ============================================
// Train Controller - Search and CRUD
// ============================================
const Train = require('../models/Train');
const Route = require('../models/Route');
const Booking = require('../models/Booking');

// @desc    Search trains between two cities
// @route   GET /api/trains/search?source=X&destination=Y&date=Z
exports.searchTrains = async (req, res) => {
  try {
    const { source, destination, date, classType } = req.query;
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

    if (routes.length === 0) return res.json({ success: true, trains: [] });

    const routeIds = routes.map(r => r._id);
    let trains = await Train.find({ route: { $in: routeIds }, isActive: true }).populate('route');

    const trainsWithPricing = trains.map(train => {
      const cheapestClass = train.classes?.reduce((min, cls) =>
        cls.price < min.price ? cls : min, train.classes[0]);

      return {
        ...train.toObject(),
        cheapestPrice: cheapestClass?.price || 0,
        isBestPrice: false
      };
    });

    // Mark the cheapest train
    if (trainsWithPricing.length > 0) {
      const minPrice = Math.min(...trainsWithPricing.map(t => t.cheapestPrice));
      trainsWithPricing.forEach(t => { if (t.cheapestPrice === minPrice) t.isBestPrice = true; });
    }

    res.json({ success: true, trains: trainsWithPricing, count: trainsWithPricing.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get train by ID
// @route   GET /api/trains/:id
exports.getTrainById = async (req, res) => {
  try {
    const train = await Train.findById(req.params.id).populate('route');
    if (!train) return res.status(404).json({ success: false, message: 'Train not found' });
    res.json({ success: true, train });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getAllTrains = async (req, res) => {
  try {
    const trains = await Train.find().populate('route').sort('-createdAt');
    res.json({ success: true, trains });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create train (Admin)
exports.createTrain = async (req, res) => {
  try {
    const train = await Train.create(req.body);
    const populated = await train.populate('route');
    res.status(201).json({ success: true, train: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete train (Admin)
exports.deleteTrain = async (req, res) => {
  try {
    await Train.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Train deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
