const express = require('express');
const router = express.Router();
const { protect, isAdmin, isAdminOrManager } = require('../middleware/auth');
const { brandValidation, validate } = require('../middleware/validation');
const {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  deleteBrand
} = require('../controllers/brandController');

// All brand routes require authentication
router.use(protect);

// GET all brands (accessible by all authenticated users)
router.get('/', getAllBrands);
router.get('/:id', getBrandById);

// Admin and Manager routes
router.post('/', isAdminOrManager, brandValidation, validate, createBrand);
router.put('/:id', isAdminOrManager, brandValidation, validate, updateBrand);
router.delete('/:id', isAdminOrManager, deleteBrand);

module.exports = router;
