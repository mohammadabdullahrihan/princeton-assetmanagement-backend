const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  url: { type: String, required: true },
  format: { type: String }, // e.g., AI, PSD, PDF, PNG, JPG, SVG
  size: { type: Number }, // in bytes
  width: { type: Number },
  height: { type: Number },
  version: { type: String, default: 'v1.0' },
  uploadedAt: { type: Date, default: Date.now }
});

const AssetSchema = new mongoose.Schema(
  {
    assetId: {
      type: String,
      unique: true,
      index: true,
    },
    assetCategory: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    files: [FileSchema],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    festivalDate: {
      type: Date,
    },
    tags: [
      {
        type: String,
        trim: true,
      }
    ],
    status: {
      type: String,
      enum: ['Draft', 'Active', 'Archived', 'InReview', 'Approved'],
      default: 'Active'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
  },
  { timestamps: true }
);

// Indexes for performance
AssetSchema.index({ festivalDate: 1 });
AssetSchema.index({ createdAt: -1 });
AssetSchema.index({ tags: 1 });
AssetSchema.index({ title: 'text', description: 'text' });

// Pre-save hook to generate assetId if not present
AssetSchema.pre('save', async function (next) {
  if (!this.assetId) {
    try {
      // Find the highest existing assetId
      const lastAsset = await mongoose.model('Asset')
        .findOne({ assetId: { $exists: true, $ne: null } })
        .sort({ assetId: -1 })
        .select('assetId')
        .lean();
      
      let nextNumber = 1;
      if (lastAsset && lastAsset.assetId) {
        // Extract number from format "CR-000010"
        const match = lastAsset.assetId.match(/CR-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1], 10) + 1;
        }
      }
      
      this.assetId = `CR-${String(nextNumber).padStart(6, '0')}`;
    } catch (error) {
      console.error('Error generating assetId:', error);
      // Fallback to timestamp-based ID if there's an error
      this.assetId = `CR-${Date.now()}`;
    }
  }
  next();
});

module.exports = mongoose.model('Asset', AssetSchema);
