// ============================================
// Route Controller - CRUD & City Autocomplete
// ============================================
const Route = require('../models/Route');

// @desc    Get all routes
// @route   GET /api/routes
exports.getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find().sort('source');
    res.json({ success: true, routes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search cities for autocomplete
// @route   GET /api/routes/cities?q=hyd
exports.searchCities = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      // Return all unique cities
      const routes = await Route.find({ isActive: true });
      const cities = [...new Set([
        ...routes.map(r => r.source),
        ...routes.map(r => r.destination)
      ])].sort();
      return res.json({ success: true, cities });
    }

    const routes = await Route.find({ isActive: true });
    const allCities = [...new Set([
      ...routes.map(r => r.source),
      ...routes.map(r => r.destination)
    ])];

    const filtered = allCities.filter(city =>
      city.toLowerCase().includes(q.toLowerCase())
    ).sort();

    res.json({ success: true, cities: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create route (Admin)
// @route   POST /api/routes
exports.createRoute = async (req, res) => {
  try {
    const route = await Route.create(req.body);
    res.status(201).json({ success: true, route });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update route (Admin)
// @route   PUT /api/routes/:id
exports.updateRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    res.json({ success: true, route });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete route (Admin)
// @route   DELETE /api/routes/:id
exports.deleteRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    res.json({ success: true, message: 'Route deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
