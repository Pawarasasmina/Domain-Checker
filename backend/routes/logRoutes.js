const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const DomainLog = require('../models/DomainLog');

// All log routes require authentication and admin role
router.use(protect);
router.use(isAdmin);

// GET all logs
router.get('/', async (req, res) => {
  try {
    const logs = await DomainLog.find().sort({ timestamp: -1 }).populate('user', 'name email');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

module.exports = router;
