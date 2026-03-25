// ============================================
// Booking Controller - Multi-Transport (Bus, Train, Flight)
// ============================================
const Booking = require('../models/Booking');
const Bus = require('../models/Bus');
const Train = require('../models/Train');
const Flight = require('../models/Flight');
const User = require('../models/User');
const { sendBookingConfirmation } = require('../utils/emailService');
const { generateTicketPDF, generateQRCode } = require('../utils/pdfGenerator');

// @desc    Create a new booking (bus, train, or flight)
// @route   POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const {
      busId, trainId, flightId,
      seatNumbers, travelDate,
      passengerName, passengerEmail, passengerPhone,
      passengers, selectedClass, passengerCount,
      transportType
    } = req.body;

    // Determine transport type
    const type = transportType || (trainId ? 'train' : flightId ? 'flight' : 'bus');

    if (!travelDate || !passengerName || !passengerEmail) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    let vehicleName, vehicleNumber, source, destination, departureTime, arrivalTime, duration, totalAmount;

    // ========== BUS BOOKING ==========
    if (type === 'bus') {
      if (!busId || !seatNumbers || seatNumbers.length === 0) {
        return res.status(400).json({ success: false, message: 'Bus ID and seats are required' });
      }

      const bus = await Bus.findById(busId).populate('route');
      if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });

      // Check double booking
      const date = new Date(travelDate);
      const startOfDay = new Date(new Date(date).setHours(0, 0, 0, 0));
      const endOfDay = new Date(new Date(date).setHours(23, 59, 59, 999));

      const existingBookings = await Booking.find({
        bus: busId, travelDate: { $gte: startOfDay, $lte: endOfDay }, status: { $ne: 'cancelled' }
      });
      const alreadyBooked = existingBookings.reduce((acc, b) => [...acc, ...b.seatNumbers], []);
      const conflicting = seatNumbers.filter(s => alreadyBooked.includes(s));
      if (conflicting.length > 0) {
        return res.status(400).json({ success: false, message: `Seats ${conflicting.join(', ')} already booked`, conflictingSeats: conflicting });
      }

      totalAmount = bus.price * seatNumbers.length;
      vehicleName = bus.busName;
      vehicleNumber = bus.busNumber;
      source = bus.route.source;
      destination = bus.route.destination;
      departureTime = bus.departureTime;
      arrivalTime = bus.arrivalTime;
      duration = bus.route.duration;
    }

    // ========== TRAIN BOOKING ==========
    else if (type === 'train') {
      if (!trainId || !selectedClass) {
        return res.status(400).json({ success: false, message: 'Train ID and class are required' });
      }

      const train = await Train.findById(trainId).populate('route');
      if (!train) return res.status(404).json({ success: false, message: 'Train not found' });

      const cls = train.classes.find(c => c.classType === selectedClass);
      if (!cls) return res.status(400).json({ success: false, message: 'Invalid class selected' });

      const pCount = passengerCount || passengers?.length || 1;
      totalAmount = cls.price * pCount;
      vehicleName = train.trainName;
      vehicleNumber = train.trainNumber;
      source = train.route.source;
      destination = train.route.destination;
      departureTime = train.departureTime;
      arrivalTime = train.arrivalTime;
      duration = train.route.duration;
    }

    // ========== FLIGHT BOOKING ==========
    else if (type === 'flight') {
      if (!flightId || !selectedClass) {
        return res.status(400).json({ success: false, message: 'Flight ID and class are required' });
      }

      const flight = await Flight.findById(flightId).populate('route');
      if (!flight) return res.status(404).json({ success: false, message: 'Flight not found' });

      const cls = flight.classes.find(c => c.classType === selectedClass);
      if (!cls) return res.status(400).json({ success: false, message: 'Invalid class selected' });

      const pCount = passengerCount || passengers?.length || 1;
      totalAmount = cls.price * pCount;
      vehicleName = `${flight.airline} ${flight.flightNumber}`;
      vehicleNumber = flight.flightNumber;
      source = flight.route.source;
      destination = flight.route.destination;
      departureTime = flight.departureTime;
      arrivalTime = flight.arrivalTime;
      duration = flight.duration;
    }

    // Generate QR code
    const qrCode = await generateQRCode({
      type, vehicle: vehicleNumber, route: `${source} to ${destination}`,
      date: travelDate, seats: seatNumbers || [], class: selectedClass || ''
    });

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      transportType: type,
      bus: type === 'bus' ? busId : undefined,
      train: type === 'train' ? trainId : undefined,
      flight: type === 'flight' ? flightId : undefined,
      seatNumbers: seatNumbers || [],
      selectedClass: selectedClass || '',
      passengerCount: passengers?.length || seatNumbers?.length || 1,
      passengers: passengers || [],
      travelDate: new Date(travelDate),
      passengerName, passengerEmail,
      passengerPhone: passengerPhone || '',
      totalAmount,
      paymentStatus: 'completed',
      status: 'confirmed',
      qrCode
    });

    // Add to user history
    await User.findByIdAndUpdate(req.user._id, {
      $push: { bookingHistory: booking._id }
    });

    // Save search
    await User.findByIdAndUpdate(req.user._id, {
      $push: { recentSearches: { $each: [{ source, destination, date: new Date() }], $slice: -10 } }
    });

    // Send email (async)
    sendBookingConfirmation({
      passengerName, passengerEmail, passengerPhone,
      bookingId: booking.bookingId,
      busName: vehicleName,
      busNumber: vehicleNumber,
      source, destination,
      seatNumbers: seatNumbers || [selectedClass || type],
      travelDate, totalAmount, departureTime,
      passengers: passengers || []
    });

    // Populate and return
    const populatedBooking = await Booking.findById(booking._id)
      .populate({ path: 'bus', populate: { path: 'route' } })
      .populate({ path: 'train', populate: { path: 'route' } })
      .populate({ path: 'flight', populate: { path: 'route' } })
      .populate('user', 'name email');

    res.status(201).json({ success: true, booking: populatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my
exports.getMyBookings = async (req, res) => {
  try {
    // Auto-complete bookings whose travel date has passed
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    await Booking.updateMany(
      { user: req.user._id, status: 'confirmed', travelDate: { $lt: startOfToday } },
      { $set: { status: 'completed' } }
    );

    const bookings = await Booking.find({ user: req.user._id })
      .populate({ path: 'bus', populate: { path: 'route' } })
      .populate({ path: 'train', populate: { path: 'route' } })
      .populate({ path: 'flight', populate: { path: 'route' } })
      .sort('-createdAt');
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({ path: 'bus', populate: { path: 'route' } })
      .populate({ path: 'train', populate: { path: 'route' } })
      .populate({ path: 'flight', populate: { path: 'route' } })
      .populate('user', 'name email phone');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Already cancelled' });
    }
    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();
    res.json({ success: true, message: 'Booking cancelled', booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Download ticket PDF
// @route   GET /api/bookings/:id/pdf
exports.downloadTicketPDF = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({ path: 'bus', populate: { path: 'route' } })
      .populate({ path: 'train', populate: { path: 'route' } })
      .populate({ path: 'flight', populate: { path: 'route' } });

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const vehicle = booking.bus || booking.train || booking.flight;
    const route = vehicle?.route;

    const pdfBuffer = await generateTicketPDF({
      bookingId: booking.bookingId,
      passengerName: booking.passengerName,
      busName: booking.bus?.busName || booking.train?.trainName || (booking.flight ? `${booking.flight.airline} ${booking.flight.flightNumber}` : 'N/A'),
      busNumber: booking.bus?.busNumber || booking.train?.trainNumber || booking.flight?.flightNumber || '',
      source: route?.source || '',
      destination: route?.destination || '',
      seatNumbers: booking.seatNumbers.length > 0 ? booking.seatNumbers : [booking.selectedClass || booking.transportType],
      travelDate: booking.travelDate,
      totalAmount: booking.totalAmount,
      departureTime: vehicle?.departureTime || '',
      arrivalTime: vehicle?.arrivalTime || ''
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=BusGo_Ticket_${booking.bookingId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get AI smart suggestions
// @route   GET /api/bookings/suggestions
exports.getSmartSuggestions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const recentSearches = user.recentSearches || [];
    const routeFrequency = {};
    recentSearches.forEach(s => {
      const key = `${s.source}-${s.destination}`;
      routeFrequency[key] = (routeFrequency[key] || 0) + 1;
    });
    const suggestions = Object.entries(routeFrequency)
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([route]) => { const [source, destination] = route.split('-'); return { source, destination }; });
    res.json({ success: true, suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
