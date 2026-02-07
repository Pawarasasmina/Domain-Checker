const mongoose = require('mongoose');

const domainSchema = new mongoose.Schema({
  domain: {
    type: String,
    required: [true, 'Domain name is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}(\/[a-z0-9\-._~:/?#[\]@!$&'()*+,;=%]*)?$/i, 'Please provide a valid domain name']
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: [true, 'Brand is required']
  },
  note: {
    type: String,
    trim: true,
    maxlength: [200, 'Note cannot exceed 200 characters']
  },
  uptime: {
    status: {
      type: String,
      enum: ['up', 'down', 'unknown'],
      default: 'unknown'
    },
    lastChecked: Date
  },
  nawala: {
    status: {
      type: String,
      enum: ['ada', 'tidak ada', 'unknown'],
      default: 'unknown'
    },
    blockedId: String,
    lastChecked: Date
  },
  cloudflare: {
    status: {
      type: String,
      enum: ['active', 'inactive', 'unknown'],
      default: 'unknown'
    },
    lastChecked: Date
  },
  google: {
    status: {
      type: String,
      enum: ['indexed', 'not indexed', 'unknown'],
      default: 'unknown'
    },
    lastChecked: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better performance
domainSchema.index({ domain: 1 });
domainSchema.index({ brand: 1 });
domainSchema.index({ 'nawala.status': 1 });
domainSchema.index({ isActive: 1 });

// Virtual for full domain info
domainSchema.virtual('fullInfo').get(function() {
  return {
    domain: this.domain,
    brand: this.brand,
    allStatuses: {
      uptime: this.uptime.status,
      nawala: this.nawala.status,
      cloudflare: this.cloudflare.status,
      google: this.google.status
    }
  };
});

module.exports = mongoose.model('Domain', domainSchema);
