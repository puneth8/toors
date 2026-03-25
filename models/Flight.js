// ============================================
// Flight Model
// ============================================
const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  airline: {
    type: String,
    required: true,
    trim: true
  },
  flightNumber: {
    type: String,
    required: true,
    unique: true
  },
  flightType: {
    type: String,
    enum: ['Domestic', 'International'],
    default: 'Domestic'
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  classes: [{
    classType: { type: String, enum: ['Economy', 'Premium Economy', 'Business', 'First'] },
    totalSeats: Number,
    price: Number
  }],
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  duration: { type: String },
  aircraft: { type: String, default: 'Boeing 737' },
  amenities: [String],
  rating: { type: Number, default: 4.2 },
  isActive: { type: Boolean, default: true },
  stops: { type: Number, default: 0 } // 0 = non-stop
}, { timestamps: true });

module.exports = mongoose.model('Flight', flightSchema);
