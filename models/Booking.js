// ============================================
// Booking Model - Multi-Transport (Bus, Train, Flight)
// ============================================
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    default: () => 'BG-' + uuidv4().slice(0, 8).toUpperCase(),
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Transport type
  transportType: {
    type: String,
    enum: ['bus', 'train', 'flight'],
    default: 'bus'
  },
  // Bus reference (optional, for bus bookings)
  bus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus'
  },
  // Train reference (optional, for train bookings)
  train: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Train'
  },
  // Flight reference (optional, for flight bookings)
  flight: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flight'
  },
  // Selected class for train/flight
  selectedClass: {
    type: String,
    default: ''
  },
  seatNumbers: {
    type: [String],
    default: []
  },
  passengerCount: {
    type: Number,
    default: 1
  },
  passengers: [{
    name: String,
    age: Number,
    gender: String,
    seat: String
  }],
  travelDate: {
    type: Date,
    required: true
  },
  passengerName: {
    type: String,
    required: true
  },
  passengerEmail: {
    type: String,
    required: true
  },
  passengerPhone: {
    type: String,
    default: ''
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'refunded'],
    default: 'completed'
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  qrCode: {
    type: String,
    default: ''
  },
  seatLockExpiry: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

bookingSchema.index({ user: 1, travelDate: 1 });
bookingSchema.index({ bus: 1, travelDate: 1 });
bookingSchema.index({ train: 1, travelDate: 1 });
bookingSchema.index({ flight: 1, travelDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
