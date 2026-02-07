const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const { registerValidation, loginValidation, validate } = require('../middleware/validation');
const {
  register,
  login,
  getMe,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/authController');

// Public routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Admin only routes
router.get('/users', protect, isAdmin, getAllUsers);
router.get('/users/:id', protect, isAdmin, getUserById);
router.put('/users/:id', protect, isAdmin, updateUser);
router.delete('/users/:id', protect, isAdmin, deleteUser);

module.exports = router;
