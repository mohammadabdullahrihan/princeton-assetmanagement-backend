const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Asset = require('../models/Asset');
const AssetLifecycle = require('../models/AssetLifecycle');

dotenv.config();

const seedData = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/asset-management';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    await User.deleteMany({});
    await Asset.deleteMany({});
    await AssetLifecycle.deleteMany({});
    console.log('🗑️  Cleared existing data');

    const admin1 = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'Admin',
      department: 'Management',
    });

    console.log('👥 Created users');

    const assets = [
      {
        assetId: 'AST-000001',
        assetType: 'ITAsset',
        name: 'Dell Laptop XPS 15',
        manufacturer: 'Dell',
        serialNumber: 'DL-2023-001',
        purchaseDate: new Date('2023-01-15'),
        purchasePrice: 1500,
        currentValue: 1200,
        depreciationRate: 20,
        condition: 'Good',
        location: 'Office Floor 3',
        assignedTo: admin1._id,
        warrantyExpiry: new Date('2025-01-15'),
        maintenanceSchedule: [
          {
            scheduledDate: new Date('2024-06-01'),
            type: 'Routine',
            description: 'System update and cleaning',
            status: 'Completed',
          },
          {
            scheduledDate: new Date('2024-12-01'),
            type: 'Routine',
            description: 'System update and cleaning',
            status: 'Pending',
          },
        ],
        createdBy: admin1._id,
      },
      {
        assetId: 'AST-000002',
        assetType: 'Vehicle',
        name: 'Toyota Camry 2022',
        manufacturer: 'Toyota',
        serialNumber: 'TC-2022-VIN123456',
        purchaseDate: new Date('2022-06-01'),
        purchasePrice: 28000,
        currentValue: 24000,
        depreciationRate: 15,
        condition: 'Good',
        location: 'Parking Lot A',
        warrantyExpiry: new Date('2025-06-01'),
        insuranceDetails: {
          provider: 'State Farm',
          policyNumber: 'SF-123456',
          coverage: 50000,
          expiryDate: new Date('2024-12-31'),
        },
        createdBy: admin1._id,
      },
      {
        assetId: 'AST-000003',
        assetType: 'Furniture',
        name: 'Executive Desk',
        manufacturer: 'IKEA',
        purchaseDate: new Date('2021-03-10'),
        purchasePrice: 800,
        currentValue: 600,
        depreciationRate: 10,
        condition: 'Fair',
        location: 'Office Floor 2, Room 201',
        createdBy: admin1._id,
      },
      {
        assetId: 'AST-000004',
        assetType: 'Equipment',
        name: 'HP LaserJet Printer',
        manufacturer: 'HP',
        serialNumber: 'HP-LJ-2023-789',
        purchaseDate: new Date('2023-05-20'),
        purchasePrice: 450,
        currentValue: 380,
        depreciationRate: 15,
        condition: 'Good',
        location: 'Office Floor 1, Print Room',
        warrantyExpiry: new Date('2024-05-20'),
        maintenanceSchedule: [
          {
            scheduledDate: new Date('2024-11-20'),
            type: 'Preventive',
            description: 'Toner replacement and cleaning',
            status: 'Pending',
          },
        ],
        createdBy: admin1._id,
      },
      {
        assetId: 'AST-000005',
        assetType: 'ITAsset',
        name: 'MacBook Pro 16"',
        manufacturer: 'Apple',
        serialNumber: 'MBP-2023-456',
        purchaseDate: new Date('2023-08-01'),
        purchasePrice: 2500,
        currentValue: 2100,
        depreciationRate: 18,
        condition: 'Good',
        location: 'Office Floor 3',
        assignedTo: admin1._id,
        warrantyExpiry: new Date('2024-08-01'),
        createdBy: admin1._id,
      },
    ];

    const createdAssets = await Asset.create(assets);
    console.log('📦 Created assets');

    for (const asset of createdAssets) {
      await AssetLifecycle.create({
        assetId: asset._id,
        status: 'Active',
        statusHistory: [
          {
            status: 'Active',
            date: asset.createdAt,
            reason: 'Asset created',
            changedBy: asset.createdBy,
          },
        ],
        maintenanceHistory: [],
        transferHistory: [],
      });
    }

    console.log('📊 Created lifecycle records');

    const firstAssetLifecycle = await AssetLifecycle.findOne({ assetId: createdAssets[0]._id });
    if (firstAssetLifecycle) {
      firstAssetLifecycle.maintenanceHistory.push({
        date: new Date('2023-06-15'),
        type: 'Preventive',
        cost: 50,
        performedBy: 'IT Support Team',
        notes: 'Cleaned and updated system',
      });
      await firstAssetLifecycle.save();
    }

    console.log('✅ Database seeded successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('Admin: admin@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
