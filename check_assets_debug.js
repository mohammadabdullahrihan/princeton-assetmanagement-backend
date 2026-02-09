require('dotenv').config();
const mongoose = require('mongoose');
const Asset = require('./src/models/Asset');

const checkAssets = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    const assets = await Asset.find({ assetCategory: 'envelop' });
    console.log(`Found ${assets.length} assets in category "envelop":`);
    
    assets.forEach((asset, index) => {
      console.log(`\nAsset ${index + 1}: ${asset.title}`);
      console.log(`ID: ${asset._id}`);
      console.log('Files:');
      asset.files.forEach((file, fIndex) => {
        console.log(`  File ${fIndex + 1}: format=${file.format}, url=${file.url}`);
      });
    });

    process.exit(0);
  } catch (error) {
    console.error('Error checking assets:', error);
    process.exit(1);
  }
};

checkAssets();
