// ============================================
// Bus Model
// ============================================
const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busName: {
    type: String,
    required: [true, 'Bus name is required'],
    trim: true
  },
  busNumber: {
    type: String,
    required: [true, 'Bus number is required'],
    unique: true,
    uppercase: true
  },
  busType: {
    type: String,
    enum: ['AC', 'Non-AC', 'Sleeper', 'Seater', 'AC-Sleeper', 'Volvo'],
    required: true
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  totalSeats: {
    type: Number,
    required: true,
    min: 1,
    max: 60
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  departureTime: {
    type: String,
    required: true
  },
  arrivalTime: {
    type: String,
    required: true
  },
  amenities: {
    type: [String],
    default: []
  },
  rating: {
    type: Number,
    default: 4.0,
    min: 0,
    max: 5
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Seat layout configuration: rows x columns
  seatLayout: {
    rows: { type: Number, default: 10 },
    columns: { type: Number, default: 4 },
    // Seats that don't exist (aisle, etc)
    unavailableSeats: [String]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bus', busSchema);
