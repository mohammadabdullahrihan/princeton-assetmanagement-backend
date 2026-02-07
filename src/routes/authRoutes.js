const express = require('express');
const {
  register,
  login,
  getMe,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
} = require('../controllers/authController');
const { authenticate, authorize } = require('../middlewares/auth');
const { userValidation } = require('../middlewares/validation');
const { asyncHandler } = require('../middlewares/errorHandler');

const router = express.Router();

router.post('/register', userValidation.register, asyncHandler(register));
router.post('/login', userValidation.login, asyncHandler(login));
router.get('/me', authenticate, asyncHandler(getMe));
router.post('/change-password', authenticate, asyncHandler(changePassword));

// Admin/Owner only routes
router.get(
  '/users',
  authenticate,
  authorize('Admin', 'Owner'),
  asyncHandler(getUsers)
);

router.get(
  '/users/:id',
  authenticate,
  authorize('Admin', 'Owner'),
  asyncHandler(getUserById)
);

router.put(
  '/users/:id',
  authenticate,
  authorize('Admin', 'Owner'),
  userValidation.update,
  asyncHandler(updateUser)
);

router.delete(
  '/users/:id',
  authenticate,
  authorize('Owner'),
  asyncHandler(deleteUser)
);

module.exports = router;
