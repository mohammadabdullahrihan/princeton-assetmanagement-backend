const express = require('express');
const {
  getAssetReport,
  getDepreciationReport,
  getMaintenanceReport,
  getDisposalReport,
  getDashboardStats,
} = require('../controllers/reportController');
const { authenticate } = require('../middlewares/auth');
const { asyncHandler } = require('../middlewares/errorHandler');

const router = express.Router();

router.get('/dashboard', authenticate, asyncHandler(getDashboardStats));
router.get('/assets', authenticate, asyncHandler(getAssetReport));
router.get('/logs', authenticate, asyncHandler(require('../controllers/reportController').getAuditLogs));
router.get('/depreciation', authenticate, asyncHandler(getDepreciationReport));
router.get('/maintenance', authenticate, asyncHandler(getMaintenanceReport));
router.get('/disposal', authenticate, asyncHandler(getDisposalReport));

module.exports = router;
