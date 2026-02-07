const mongoose = require('mongoose');

const AssetLifecycleSchema = new mongoose.Schema(
  {
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['Active', 'In Maintenance', 'Disposed', 'Lost', 'Sold'],
      default: 'Active',
      required: true,
    },
    statusHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
          required: true,
        },
        reason: {
          type: String,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
      },
    ],
    maintenanceHistory: [
      {
        date: {
          type: Date,
          required: true,
          default: Date.now,
        },
        type: {
          type: String,
          required: true,
          enum: ['Preventive', 'Corrective', 'Predictive', 'Emergency', 'Routine'],
        },
        cost: {
          type: Number,
          required: true,
          min: 0,
        },
        performedBy: {
          type: String,
          required: true,
        },
        notes: {
          type: String,
        },
        attachments: [String],
      },
    ],
    transferHistory: [
      {
        from: {
          type: mongoose.Schema.Types.Mixed,
          required: true,
        },
        to: {
          type: mongoose.Schema.Types.Mixed,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
          required: true,
        },
        reason: {
          type: String,
        },
        approvedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
AssetLifecycleSchema.index({ status: 1 });
AssetLifecycleSchema.index({ 'statusHistory.date': -1 });
AssetLifecycleSchema.index({ 'maintenanceHistory.date': -1 });

// Methods
AssetLifecycleSchema.methods.addStatusChange = function (status, changedBy, reason) {
  this.status = status;
  this.statusHistory.push({
    status,
    date: new Date(),
    reason,
    changedBy,
  });
  return this.save();
};

AssetLifecycleSchema.methods.addMaintenance = function (maintenanceData) {
  this.maintenanceHistory.push(maintenanceData);
  return this.save();
};

AssetLifecycleSchema.methods.addTransfer = function (transferData) {
  this.transferHistory.push(transferData);
  return this.save();
};

module.exports = mongoose.model('AssetLifecycle', AssetLifecycleSchema);
