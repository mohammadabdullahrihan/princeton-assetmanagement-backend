const Asset = require('../models/Asset');
const { ApiError } = require('../middlewares/errorHandler');

/**
 * Get overall asset report
 */
const getAssetReport = async (req, res) => {
  try {
    const { startDate, endDate, assetCategory } = req.query;

    const filter = {};
    if (assetCategory) filter.assetCategory = assetCategory;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const assets = await Asset.find(filter).sort({ createdAt: -1 });

    const totalAssets = assets.length;
    const byCategory = assets.reduce((acc, asset) => {
      acc[asset.assetCategory] = (acc[asset.assetCategory] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalAssets,
        },
        byCategory,
        assets,
      },
    });
  } catch (error) {
    throw new ApiError(500, error.message);
  }
};

/**
 * Dashboard Statistics refactored for Creative Assets
 */
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const [
      totalAssets,
      upcomingFestivals,
      recentAssets,
      categoryStats
    ] = await Promise.all([
      Asset.countDocuments(),
      Asset.find({
        festivalDate: { $gte: now, $lte: thirtyDaysFromNow }
      }).sort({ festivalDate: 1 }).limit(10),
      Asset.find({}).sort({ createdAt: -1 }).limit(5),
      Asset.aggregate([
        { $group: { _id: '$assetCategory', count: { $sum: 1 } } }
      ])
    ]);

    const categoryDistribution = {};
    categoryStats.forEach(stat => {
      categoryDistribution[stat._id] = stat.count;
    });

    res.status(200).json({
      success: true,
      data: {
        totalAssets,
        upcomingFestivalCount: upcomingFestivals.length,
        upcomingFestivals: upcomingFestivals.map(a => ({
          id: a._id,
          title: a.title,
          category: a.assetCategory,
          date: a.festivalDate,
          daysLeft: Math.ceil((new Date(a.festivalDate) - now) / (1000 * 60 * 60 * 24))
        })),
        categoryDistribution,
        recentUploads: recentAssets.map(a => ({
          id: a._id,
          title: a.title,
          category: a.assetCategory,
          uploadedAt: a.createdAt,
          thumbnail: a.files?.[0]?.url || null
        }))
      },
    });
  } catch (error) {
    throw new ApiError(500, error.message);
  }
};

const getDepreciationReport = async (req, res) => res.status(200).json({ success: true, data: { summary: {}, assets: [] } });
const getMaintenanceReport = async (req, res) => res.status(200).json({ success: true, data: { summary: {}, maintenance: [] } });
const getDisposalReport = async (req, res) => res.status(200).json({ success: true, data: { summary: {}, assets: [] } });

module.exports = {
  getAssetReport,
  getDashboardStats,
  getDepreciationReport,
  maintenanceReport: getMaintenanceReport,
  disposalReport: getDisposalReport,
};
