require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    return await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear all collections
const clearDatabase = async () => {
  try {
    const conn = await connectDB();
    console.log(`Connected to MongoDB: ${conn.connection.host}`);
    
    // Get all collections
    const collections = await mongoose.connection.db.collections();
    
    console.log('The following collections will be cleared:');
    collections.forEach(collection => {
      // Skip system collections
      if (!collection.collectionName.startsWith('system.')) {
        console.log(`- ${collection.collectionName}`);
      }
    });
    
    // Ask for confirmation
    rl.question('\nAre you sure you want to clear all data? This action cannot be undone. (yes/no): ', async (answer) => {
      if (answer.toLowerCase() === 'yes') {
        console.log('\nClearing collections...');
        
        // Drop each collection
        for (const collection of collections) {
          // Skip system collections
          if (!collection.collectionName.startsWith('system.')) {
            await collection.drop();
            console.log(`Cleared collection: ${collection.collectionName}`);
          }
        }
        
        console.log('\nDatabase has been cleared successfully!');
      } else {
        console.log('Operation cancelled.');
      }
      
      // Close connection and exit
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
      rl.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
};

// Run the script
clearDatabase(); 