const mongoose = require('mongoose');
require('dotenv').config();

const Brand = require('./models/Brand');
const User = require('./models/User');

// Brand data with colors extracted from CSS
const brandsData = [
  // 200M Series
  { name: 'A200M', code: 'A200M', color: '#02bca2', description: '200M Series' },
  { name: 'B200M', code: 'B200M', color: '#4582b4', description: '200M Series' },
  { name: 'C200M', code: 'C200M', color: '#67c700', description: '200M Series' },
  { name: 'D200M', code: 'D200M', color: '#00ff83', description: '200M Series' },
  { name: 'E200M', code: 'E200M', color: '#0053cb', description: '200M Series' },
  { name: 'F200M', code: 'F200M', color: '#fede9d', description: '200M Series' },
  { name: 'G200M', code: 'G200M', color: '#f60002', description: '200M Series' },
  { name: 'K200M', code: 'K200M', color: '#00e0ba', description: '200M Series' },
  { name: 'P200M', code: 'P200M', color: '#01ddff', description: '200M Series' },
  { name: 'J200M', code: 'J200M', color: '#81db01', description: '200M Series' },
  { name: 'Y200M', code: 'Y200M', color: '#7500b8', description: '200M Series' },
  { name: 'PASTI200M', code: 'PASTI200M', color: '#fa06ba', description: '200M Series' },
  
  // SGC Series
  { name: 'SGCWIN', code: 'SGCWIN', color: '#02bca2', description: 'SGC Series' },
  { name: 'SGCWIN77', code: 'SGCWIN77', color: '#2b8cbb', description: 'SGC Series' },
  { name: 'SGCWIN88', code: 'SGCWIN88', color: '#8a7132', description: 'SGC Series' },
  { name: 'SGCPLAY', code: 'SGCPLAY', color: '#f4e303', description: 'SGC Series' },
  { name: 'SGCVIP', code: 'SGCVIP', color: '#008262', description: 'SGC Series' },
  
  // ASIA Series
  { name: 'ASIA100', code: 'ASIA100', color: '#fd5858', description: 'ASIA Series' },
  { name: 'ASIA200', code: 'ASIA200', color: '#ffc325', description: 'ASIA Series' },
  { name: 'ASIA300', code: 'ASIA300', color: '#ffb100', description: 'ASIA Series' },
  
  // TIKET Series
  { name: 'TIKET100', code: 'TIKET100', color: '#d6b851', description: 'TIKET Series' },
  { name: 'TIKET200', code: 'TIKET200', color: '#63fe4c', description: 'TIKET Series' },
  { name: 'TIKET300', code: 'TIKET300', color: '#579dff', description: 'TIKET Series' },
  
  // Miscellaneous Brands
  { name: 'SUPER89', code: 'SUPER89', color: '#ffd700', description: 'Miscellaneous' },
  { name: 'RAJA100', code: 'RAJA100', color: '#2dbdfa', description: 'Miscellaneous' },
  { name: 'TOP111', code: 'TOP111', color: '#fede9d', description: 'Miscellaneous' },
  { name: 'PADUKA500', code: 'PADUKA500', color: '#02bca2', description: 'Miscellaneous' },
  { name: 'AUTOQRIS77', code: 'AUTOQRIS77', color: '#00ff83', description: 'Miscellaneous' },
  { name: 'FUFUSLOT', code: 'FUFUSLOT', color: '#f7a103', description: 'Miscellaneous' },
  { name: 'JOS007', code: 'JOS007', color: '#41760c', description: 'Miscellaneous' },
  { name: 'DEPO89', code: 'DEPO89', color: '#fa06ba', description: 'Miscellaneous' },
  { name: 'BONASLOT', code: 'BONASLOT', color: '#4582b4', description: 'Miscellaneous' },
  { name: 'MADURA88', code: 'MADURA88', color: '#b80000', description: 'Miscellaneous' },
  { name: 'NUSA211', code: 'NUSA211', color: '#fbeb8c', description: 'Miscellaneous' }
];

async function migrateBrands() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    // Find an admin user to use as createdBy
    let adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('⚠️  No admin user found. Please create an admin user first.');
      console.log('Run: node seed-admin.js');
      process.exit(1);
    }

    console.log(`✓ Using admin user: ${adminUser.email}`);

    // Get existing brands to avoid duplicates
    const existingBrands = await Brand.find({});
    const existingCodes = existingBrands.map(b => b.code);
    
    console.log(`\n📊 Found ${existingBrands.length} existing brands`);
    
    // Filter out brands that already exist
    const newBrands = brandsData.filter(brand => !existingCodes.includes(brand.code));
    
    if (newBrands.length === 0) {
      console.log('✅ All brands already exist in database');
      process.exit(0);
    }

    console.log(`\n🆕 Adding ${newBrands.length} new brands...\n`);

    // Insert new brands
    let successCount = 0;
    let errorCount = 0;

    for (const brandData of newBrands) {
      try {
        const brand = new Brand({
          ...brandData,
          isActive: true,
          createdBy: adminUser._id
        });
        await brand.save();
        console.log(`✓ Added: ${brandData.name} (${brandData.color})`);
        successCount++;
      } catch (error) {
        console.error(`✗ Failed to add ${brandData.name}: ${error.message}`);
        errorCount++;
      }
    }

    console.log(`\n📈 Migration Summary:`);
    console.log(`   ✅ Successfully added: ${successCount} brands`);
    console.log(`   ❌ Failed: ${errorCount} brands`);
    console.log(`   📊 Total brands in database: ${existingBrands.length + successCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateBrands();
