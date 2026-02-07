const Asset = require('../models/Asset');
const AuditLog = require('../models/AuditLog');
const { ApiError } = require('../middlewares/errorHandler');
const storageService = require('../services/storageService');
const assetTypes = require('../config/assetTypes');
const { logAction } = require('../utils/auditLogger');

/**
 * Get all assets with filtering and pagination
 */
const getAssets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100,
      assetCategory,
      search,
      festivalDateStart,
      festivalDateEnd,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const filter = {};
    if (assetCategory) filter.assetCategory = assetCategory;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (festivalDateStart || festivalDateEnd) {
      filter.festivalDate = {};
      if (festivalDateStart) filter.festivalDate.$gte = new Date(festivalDateStart);
      if (festivalDateEnd) filter.festivalDate.$lte = new Date(festivalDateEnd);
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      filter.tags = { $all: tagArray };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [assets, total] = await Promise.all([
      Asset.find(filter)
        .populate('createdBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Asset.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: assets,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
      assetTypes
    });
  } catch (error) {
    throw new ApiError(500, error.message);
  }
};

/**
 * Get single asset & Log View
 */
const getAssetById = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await Asset.findById(id).populate('createdBy', 'name email');

    if (!asset) {
      throw new ApiError(404, 'Asset not found');
    }

    // Audit Log: View
    await logAction(req, 'VIEW', asset._id, { title: asset.title });

    res.status(200).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
};

/**
 * Create new asset
 */
const createAsset = async (req, res) => {
  try {
    const { assetCategory, title, description, metadata, festivalDate, tags } = req.body;
    
    if (!assetTypes[assetCategory]) {
      throw new ApiError(400, `Invalid asset category: ${assetCategory}`);
    }

    const files = req.files ? req.files.map(file => storageService.getFileMetadata(file)) : [];
    
    const asset = new Asset({
      assetCategory,
      title,
      description,
      metadata: metadata ? (typeof metadata === 'string' ? JSON.parse(metadata) : metadata) : {},
      festivalDate,
      tags: tags ? (typeof tags === 'string' ? tags.split(',') : tags) : [],
      files,
      createdBy: req.user._id,
    });

    await asset.save();
    await logAction(req, 'UPLOAD', asset._id, { title: asset.title, fileCount: files.length });

    res.status(201).json({
      success: true,
      message: 'Asset created successfully',
      data: asset,
    });
  } catch (error) {
    throw new ApiError(400, error.message);
  }
};

/**
 * Update asset
 */
const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { assetCategory, title, description, metadata, festivalDate, tags, removeFiles } = req.body;

    const asset = await Asset.findById(id);
    if (!asset) throw new ApiError(404, 'Asset not found');

    const newFiles = req.files ? req.files.map(file => storageService.getFileMetadata(file)) : [];
    
    let currentFiles = asset.files;
    if (removeFiles) {
      const filesToRemove = Array.isArray(removeFiles) ? removeFiles : [removeFiles];
      currentFiles = currentFiles.filter(f => !filesToRemove.includes(f.url));
    }

    const updateData = {
      assetCategory: assetCategory || asset.assetCategory,
      title: title || asset.title,
      description: description || asset.description,
      metadata: metadata ? (typeof metadata === 'string' ? JSON.parse(metadata) : metadata) : asset.metadata,
      festivalDate: festivalDate || asset.festivalDate,
      tags: tags ? (typeof tags === 'string' ? tags.split(',') : tags) : asset.tags,
      files: [...currentFiles, ...newFiles]
    };

    const updatedAsset = await Asset.findByIdAndUpdate(id, updateData, { new: true });
    await logAction(req, 'UPDATE', id, { title: updatedAsset.title });

    res.status(200).json({ success: true, data: updatedAsset });
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
};

/**
 * Delete asset
 */
const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await Asset.findById(id);
    if (!asset) throw new ApiError(404, 'Asset not found');

    for (const file of asset.files) {
      await storageService.deleteFile(file.url);
    }

    await logAction(req, 'DELETE', id, { title: asset.title });
    await Asset.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Asset deleted' });
  } catch (error) {
    throw new ApiError(500, error.message);
  }
};

/**
 * Log Download Activity
 */
const logDownload = async (req, res) => {
  try {
    const { id } = req.params;
    const { version, fileName } = req.query;
    await logAction(req, 'DOWNLOAD', id, { version, fileName });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

module.exports = {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  logDownload
};
