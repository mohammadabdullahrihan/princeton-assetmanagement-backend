const { body, param, query } = require('express-validator');

const assetValidation = {
  create: [
    body('assetType')
      .isIn(['ITAsset', 'Vehicle', 'Furniture', 'Equipment', 'RealEstate', 'Other'])
      .withMessage('Invalid asset type'),
    body('name').trim().notEmpty().withMessage('Asset name is required'),
    body('purchaseDate').isISO8601().withMessage('Valid purchase date is required'),
    body('purchasePrice')
      .isFloat({ min: 0 })
      .withMessage('Purchase price must be a positive number'),
    body('currentValue')
      .isFloat({ min: 0 })
      .withMessage('Current value must be a positive number'),
    body('depreciationRate')
      .isFloat({ min: 0, max: 100 })
      .withMessage('Depreciation rate must be between 0 and 100'),
    body('condition')
      .isIn(['Good', 'Fair', 'Poor'])
      .withMessage('Condition must be Good, Fair, or Poor'),
    body('location').trim().notEmpty().withMessage('Location is required'),
  ],

  update: [
    param('id').isMongoId().withMessage('Invalid asset ID'),
    body('assetType')
      .optional()
      .isIn(['ITAsset', 'Vehicle', 'Furniture', 'Equipment', 'RealEstate', 'Other'])
      .withMessage('Invalid asset type'),
    body('name').optional().trim().notEmpty().withMessage('Asset name cannot be empty'),
    body('purchaseDate').optional().isISO8601().withMessage('Valid purchase date is required'),
    body('purchasePrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Purchase price must be a positive number'),
    body('currentValue')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Current value must be a positive number'),
    body('depreciationRate')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Depreciation rate must be between 0 and 100'),
    body('condition')
      .optional()
      .isIn(['Good', 'Fair', 'Poor'])
      .withMessage('Condition must be Good, Fair, or Poor'),
  ],

  getById: [param('id').isMongoId().withMessage('Invalid asset ID')],

  delete: [param('id').isMongoId().withMessage('Invalid asset ID')],

  list: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('assetType')
      .optional()
      .isIn(['ITAsset', 'Vehicle', 'Furniture', 'Equipment', 'RealEstate', 'Other'])
      .withMessage('Invalid asset type'),
    query('condition')
      .optional()
      .isIn(['Good', 'Fair', 'Poor'])
      .withMessage('Invalid condition'),
  ],

  addMaintenance: [
    param('id').isMongoId().withMessage('Invalid asset ID'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('type')
      .isIn(['Preventive', 'Corrective', 'Predictive', 'Emergency', 'Routine'])
      .withMessage('Invalid maintenance type'),
    body('cost').isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
    body('performedBy').trim().notEmpty().withMessage('Performed by is required'),
  ],

  transfer: [
    param('id').isMongoId().withMessage('Invalid asset ID'),
    body('to').notEmpty().withMessage('Transfer destination is required'),
  ],

  changeStatus: [
    param('id').isMongoId().withMessage('Invalid asset ID'),
    body('status')
      .isIn(['Active', 'In Maintenance', 'Disposed', 'Lost', 'Sold'])
      .withMessage('Invalid status'),
  ],
};

const userValidation = {
  register: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .optional()
      .isIn(['Admin', 'Owner', 'Viewer'])
      .withMessage('Invalid role'),
  ],

  login: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],

  update: [
    param('id').isMongoId().withMessage('Invalid user ID'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('role')
      .optional()
      .isIn(['Admin', 'Owner', 'Viewer'])
      .withMessage('Invalid role'),
  ],
};

module.exports = {
  assetValidation,
  userValidation,
};
