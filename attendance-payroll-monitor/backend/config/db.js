const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000 // Stop trying after 5 seconds
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MONGODB ERROR: ${error.message}`);
    console.log("👉 Tip: Check your IP Whitelist and your .env credentials.");
    // We removed process.exit(1) so the server stays alive
  }
};

module.exports = connectDB;
