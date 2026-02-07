const express = require('express');
const router = express.Router();
const { protect, isAdmin, isAdminOrManager } = require('../middleware/auth');
const { domainValidation, validate } = require('../middleware/validation');
const {
  createDomain,
  getAllDomains,
  getDomainById,
  updateDomain,
  deleteDomain,
  updateDomainStatus,
  deleteAllBlockedDomains
} = require('../controllers/domainController');
const { bulkImportDomains } = require('../controllers/bulkDomainController');

// All domain routes require authentication
router.use(protect);

// GET all domains (accessible by all authenticated users)
router.get('/', getAllDomains);
router.get('/:id', getDomainById);

// Admin and Manager routes
router.post('/', isAdminOrManager, domainValidation, validate, createDomain);
router.post('/bulk-import', isAdminOrManager, bulkImportDomains);
router.delete('/bulk-delete-blocked', isAdminOrManager, deleteAllBlockedDomains);
router.put('/:id', isAdminOrManager, domainValidation, validate, updateDomain);
router.delete('/:id', isAdminOrManager, deleteDomain);

// Status update route (can be used by system/webhook)
router.patch('/:id/status', isAdmin, updateDomainStatus);

module.exports = router;
