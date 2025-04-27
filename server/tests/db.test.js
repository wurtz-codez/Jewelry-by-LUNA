const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Jewelry = require('../models/Jewelry');

describe('Database Connection', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('should connect to the test database', () => {
    expect(mongoose.connection.readyState).toBe(1);
  });

  test('should be able to create and retrieve a jewelry item', async () => {
    // Create a test jewelry item
    const testJewelry = new Jewelry({
      name: 'Test Necklace',
      description: 'A beautiful test necklace',
      price: 99.99,
      category: 'necklace',
      imageUrl: 'https://example.com/test-necklace.jpg',
      stock: 10
    });

    await testJewelry.save();
    
    // Retrieve the test jewelry item
    const retrievedJewelry = await Jewelry.findOne({ name: 'Test Necklace' });
    
    expect(retrievedJewelry).toBeDefined();
    expect(retrievedJewelry.name).toBe('Test Necklace');
    expect(retrievedJewelry.price).toBe(99.99);
    
    // Clean up
    await Jewelry.deleteOne({ _id: retrievedJewelry._id });
  });
});