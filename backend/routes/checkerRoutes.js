const express = require('express');
const router = express.Router();
const { getAllUrls, updateUrlStatus } = require('../controllers/checkerController');

// Routes for external checking system integration
router.get('/', getAllUrls);
router.post('/update', updateUrlStatus);

module.exports = router;
