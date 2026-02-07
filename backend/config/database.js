const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes
    await createIndexes();
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    const User = require('../models/User');
    const Brand = require('../models/Brand');
    const Domain = require('../models/Domain');
    
    await User.createIndexes();
    await Brand.createIndexes();
    await Domain.createIndexes();
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error.message);
  }
};

module.exports = connectDB;
