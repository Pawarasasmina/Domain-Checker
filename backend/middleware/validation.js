const { body, validationResult } = require('express-validator');

// Validation middleware
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// User validation rules
exports.registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'user']).withMessage('Invalid role')
];

exports.loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Brand validation rules
exports.brandValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Brand name is required')
    .isLength({ max: 50 }).withMessage('Brand name cannot exceed 50 characters')
    .toUpperCase(),
  body('code')
    .trim()
    .notEmpty().withMessage('Brand code is required')
    .isLength({ max: 20 }).withMessage('Brand code cannot exceed 20 characters')
    .toUpperCase(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Please provide a valid hex color')
];

// Domain validation rules
exports.domainValidation = [
  body('domain')
    .trim()
    .notEmpty().withMessage('Domain name is required')
    .toLowerCase()
    .matches(/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/).withMessage('Please provide a valid domain name'),
  body('brand')
    .notEmpty().withMessage('Brand is required')
    .isMongoId().withMessage('Invalid brand ID'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Note cannot exceed 200 characters')
];
