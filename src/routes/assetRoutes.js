const express = require('express');
const {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
} = require('../controllers/assetController');
const { authenticate } = require('../middlewares/auth');
const { asyncHandler } = require('../middlewares/errorHandler');
const storageService = require('../services/storageService');

const router = express.Router();

router.get(
  '/',
  authenticate,
  asyncHandler(getAssets)
);

router.get(
  '/:id',
  authenticate,
  asyncHandler(getAssetById)
);

router.post(
  '/',
  authenticate,
  storageService.upload.array('files', 5), // Allow up to 5 files
  asyncHandler(createAsset)
);

router.put(
  '/:id',
  authenticate,
  storageService.upload.array('files', 5),
  asyncHandler(updateAsset)
);

router.delete(
  '/:id',
  authenticate,
  asyncHandler(deleteAsset)
);

router.post(
  '/:id/log-download',
  authenticate,
  asyncHandler(require('../controllers/assetController').logDownload)
);

module.exports = router;
