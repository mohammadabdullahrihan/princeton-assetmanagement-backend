require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const updateAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    const newEmail = 'admin@princeton.com';
    const newPassword = 'admin123';

    // Find the first admin user or search by current email if known
    let user = await User.findOne({ role: 'Admin' });
    
    if (!user) {
      console.log('No Admin user found. Creating a new one...');
      user = new User({
        name: 'Md. Nazmul Haider',
        email: newEmail,
        password: newPassword,
        role: 'Admin',
        department: 'Managing Director'
      });
    } else {
      console.log(`Updating user: ${user.email}`);
      user.email = newEmail;
      user.password = newPassword;
    }

    await user.save();
    console.log('Admin user updated successfully!');
    console.log(`Email: ${newEmail}`);
    console.log(`Password: ${newPassword}`);

    process.exit(0);
  } catch (error) {
    console.error('Error updating admin:', error);
    process.exit(1);
  }
};

updateAdmin();
