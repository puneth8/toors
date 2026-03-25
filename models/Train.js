// ============================================
// Train Model
// ============================================
const mongoose = require('mongoose');

const trainSchema = new mongoose.Schema({
  trainName: {
    type: String,
    required: true,
    trim: true
  },
  trainNumber: {
    type: String,
    required: true,
    unique: true
  },
  trainType: {
    type: String,
    enum: ['Express', 'Superfast', 'Rajdhani', 'Shatabdi', 'Duronto', 'Vande Bharat', 'Garib Rath', 'Local'],
    required: true
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  classes: [{
    classType: { type: String, enum: ['SL', '3A', '2A', '1A', 'CC', '2S', 'GN'] },
    totalSeats: Number,
    price: Number
  }],
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  daysOfWeek: [String], // ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  amenities: [String],
  rating: { type: Number, default: 4.0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Train', trainSchema);
