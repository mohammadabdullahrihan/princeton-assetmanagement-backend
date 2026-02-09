const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Asset = require('../models/Asset');

dotenv.config();

const categories = [
  { id: 'poster', name: 'Poster', imgPrefix: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=800&q=80', metadata: { festival: 'Cultural Fest', size: '18x24 in' } },
  { id: 'logo', name: 'Logo', imgPrefix: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=800&q=80', metadata: { brandVariant: 'Monochrome', isSymbolOnly: true } },
  { id: 'tshirt', name: 'T-Shirt', imgPrefix: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80', metadata: { size: 'Large', color: 'White' } },
  { id: 'envelop', name: 'Envelop', imgPrefix: 'https://images.unsplash.com/photo-1626260124317-0200888636ba?w=800&q=80', metadata: { size: 'A4' } },
  { id: 'banner', name: 'Banner', imgPrefix: 'https://images.unsplash.com/photo-1516245834210-c4c142787335?w=800&q=80', metadata: { dimensions: '6x3 ft', material: 'Flex' } },
  { id: 'id_card', name: 'ID Card', imgPrefix: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80', metadata: { employeeName: 'Demo Employee', designation: 'Staff', expiryDate: '2026-12-31' } },
  { id: 'visiting_card', name: 'Visiting Card', imgPrefix: 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6?w=800&q=80', metadata: { personName: 'Manager Name', firmName: 'Studio Pro' } },
  { id: 'pen', name: 'Pen', imgPrefix: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&q=80', metadata: { brand: 'Signature Series' } },
  { id: 'glass', name: 'Glass', imgPrefix: 'https://images.unsplash.com/photo-1581091870622-0402b8966816?w=800&q=80', metadata: { glassType: 'Ceramic' } },
  { id: 'receipt', name: 'Receipt', imgPrefix: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80', metadata: { receiptNo: 'R-101', date: '2024-01-01' } },
  { id: 'bag', name: 'Bag', imgPrefix: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80', metadata: { bagType: 'Tote Bag', material: 'Cotton' } },
  { id: 'other', name: 'Other Asset', imgPrefix: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=800&q=80', metadata: { note: 'Miscellaneous item' } }
];

const seedData = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    await Asset.deleteMany({});
    console.log('🗑️  Cleared existing assets');

    const admin = await User.findOne({ role: 'Admin' });
    if (!admin) {
      console.error('❌ Admin user not found. Please create a user first.');
      process.exit(1);
    }

    const assetsToCreate = [];

    categories.forEach(cat => {
      for (let i = 1; i <= 5; i++) {
        assetsToCreate.push({
          assetCategory: cat.id,
          title: `${cat.name} Design v${i}`,
          description: `High-quality ${cat.name.toLowerCase()} design version ${i} for professional use.`,
          metadata: { ...cat.metadata, version: `v${i}.0` },
          tags: [cat.name, 'Creative', 'Demo'],
          files: [{ 
            url: cat.imgPrefix + `&sig=${cat.id}${i}`, // Unique signature for variation
            format: 'JPG', 
            size: Math.floor(Math.random() * 5000000) + 1000000, 
            originalName: `${cat.id}_v${i}.jpg` 
          }],
          createdBy: admin._id
        });
      }
    });

    // Insertion loop to ensure unique assetId generation via save hooks
    let count = 0;
    for (const assetData of assetsToCreate) {
      const asset = new Asset(assetData);
      await asset.save();
      count++;
      if (count % 10 === 0) console.log(`📦 Inserted ${count} assets...`);
    }

    console.log(`✅ Success! Data seeded for all 12 categories. Total assets: ${count}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
