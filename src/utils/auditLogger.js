const AuditLog = require('../models/AuditLog');

/**
 * Audit Logger Utility
 */
const logAction = async (req, action, assetId, details = {}) => {
  try {
    const auditEntry = new AuditLog({
      action,
      assetId,
      userId: req.user?._id,
      details: {
        ...details,
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.connection.remoteAddress
      }
    });
    await auditEntry.save();
  } catch (error) {
    console.error('Audit Log Error:', error.message);
    // Non-blocking: We don't want to crash the request if logging fails
  }
};

module.exports = { logAction };
