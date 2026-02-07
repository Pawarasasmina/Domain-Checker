const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Brand name is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [50, 'Brand name cannot exceed 50 characters']
  },
  code: {
    type: String,
    required: [true, 'Brand code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [20, 'Brand code cannot exceed 20 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  color: {
    type: String,
    default: '#3B82F6',
    match: [/^#[0-9A-Fa-f]{6}$/, 'Please provide a valid hex color']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
brandSchema.index({ name: 1, isActive: 1 });

module.exports = mongoose.model('Brand', brandSchema);
