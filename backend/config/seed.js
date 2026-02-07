const User = require('../models/User');

const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      const admin = await User.create({
        name: 'Administrator',
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin',
        isActive: true
      });
      
      console.log('✓ Default admin user created');
      console.log(`  Email: ${admin.email}`);
      console.log('  Password: Check your .env file');
      console.log('  ⚠️  Please change the default password after first login!');
    }
  } catch (error) {
    console.error('Error creating default admin:', error.message);
  }
};

module.exports = createDefaultAdmin;
