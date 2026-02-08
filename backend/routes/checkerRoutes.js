const express = require('express');
const router = express.Router();
const { getAllUrls, updateUrlStatus, bulkUpdateUrlStatus, bulkCheck } = require('../controllers/checkerController');
const { protect } = require('../middleware/auth');

// Routes for external checking system integration
router.get('/', getAllUrls);
router.post('/update', updateUrlStatus);
router.post('/bulk-update', bulkUpdateUrlStatus);
// Proxy endpoint for frontend to request manual bulk checks via backend
router.post('/bulk-check', protect, bulkCheck);

module.exports = router;
