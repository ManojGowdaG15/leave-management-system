const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
      socketTimeoutMS: 45000, // Close sockets after 45s
    });
    
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Atlas Connection Error: ${error.message}`);
    console.log('⚠️ Please check:');
    console.log('   1. Your Atlas cluster is running');
    console.log('   2. IP is whitelisted in Atlas (0.0.0.0/0 for all)');
    console.log('   3. Database user credentials are correct');
    console.log('   4. Internet connection is stable');
    
    // Fallback to local MongoDB if Atlas fails
    console.log('🔄 Attempting fallback to local MongoDB...');
    try {
      const localConn = await mongoose.connect('mongodb://localhost:27017/leave_management', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`✅ Fallback: Local MongoDB Connected`);
      return localConn;
    } catch (fallbackError) {
      console.error('❌ Both Atlas and local MongoDB failed');
      process.exit(1);
    }
  }
};

module.exports = connectDB;