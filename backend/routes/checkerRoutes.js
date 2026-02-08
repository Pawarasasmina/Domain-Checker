const express = require('express');
const router = express.Router();
const { getAllUrls, updateUrlStatus, bulkUpdateUrlStatus } = require('../controllers/checkerController');

// Routes for external checking system integration
router.get('/', getAllUrls);
router.post('/update', updateUrlStatus);
router.post('/bulk-update', bulkUpdateUrlStatus);

module.exports = router;
