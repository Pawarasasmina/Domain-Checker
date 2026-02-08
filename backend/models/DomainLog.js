const mongoose = require('mongoose');

const domainLogSchema = new mongoose.Schema({
  domain: {
    type: String,
    required: true,
    trim: true
  },
  action: {
    type: String,
    enum: ['add', 'delete'],
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DomainLog', domainLogSchema);
