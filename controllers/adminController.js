// ============================================
// Admin Controller - Dashboard & Management
// ============================================
const User = require('../models/User');
const Booking = require('../models/Booking');
const Bus = require('../models/Bus');
const Route = require('../models/Route');

// @desc    Get admin dashboard analytics
// @route   GET /api/admin/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalBookings = await Booking.countDocuments();
    const totalBuses = await Bus.countDocuments();
    const totalRoutes = await Route.countDocuments();

    const activeBookings = await Booking.countDocuments({ status: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    // Revenue calculation
    const revenueResult = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Popular routes
    const popularRoutes = await Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $lookup: { from: 'buses', localField: 'bus', foreignField: '_id', as: 'busInfo' } },
      { $unwind: '$busInfo' },
      { $lookup: { from: 'routes', localField: 'busInfo.route', foreignField: '_id', as: 'routeInfo' } },
      { $unwind: '$routeInfo' },
      { $group: {
        _id: { source: '$routeInfo.source', destination: '$routeInfo.destination' },
        count: { $sum: 1 },
        revenue: { $sum: '$totalAmount' }
      }},
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Daily bookings for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyBookings = await Booking.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        revenue: { $sum: '$totalAmount' }
      }},
      { $sort: { _id: 1 } }
    ]);

    // Recent bookings
    const recentBookings = await Booking.find()
      .populate({ path: 'bus', populate: { path: 'route' } })
      .populate('user', 'name email')
      .sort('-createdAt')
      .limit(10);

    res.json({
      success: true,
      data: {
        stats: { totalUsers, totalBookings, totalBuses, totalRoutes, activeBookings, cancelledBookings, totalRevenue },
        popularRoutes,
        dailyBookings,
        recentBookings
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort('-createdAt');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Block/Unblock user
// @route   PUT /api/admin/users/:id/block
exports.toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/admin/bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({ path: 'bus', populate: { path: 'route' } })
      .populate('user', 'name email phone')
      .sort('-createdAt');

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
