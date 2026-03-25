// ============================================
// Route Model (Bus Routes between cities)
// ============================================
const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  source: {
    type: String,
    required: [true, 'Source city is required'],
    trim: true
  },
  destination: {
    type: String,
    required: [true, 'Destination city is required'],
    trim: true
  },
  distance: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for fast search
routeSchema.index({ source: 1, destination: 1 });

module.exports = mongoose.model('Route', routeSchema);
