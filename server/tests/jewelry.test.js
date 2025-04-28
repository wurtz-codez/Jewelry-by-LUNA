const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index');
const User = require('../models/User');
const Jewelry = require('../models/Jewelry');

let mongoServer;
let adminToken;
let userToken;
let testJewelryId;
let server;

// Test data
const adminUser = {
  email: 'admin@test.com',
  password: 'admin123',
  name: 'Admin User',
  role: 'admin'
};

const normalUser = {
  email: 'user@test.com',
  password: 'user123',
  name: 'Normal User',
  role: 'user'
};

const testJewelry = {
  name: 'Test Necklace',
  description: 'Test Description',
  detailedDescription: 'Detailed test description',
  price: 99.99,
  category: 'necklace',
  imageUrl: 'https://test.com/image.jpg',
  stock: 10,
  rating: 0,
  isAvailable: true
};

// Setup before all tests
beforeAll(async () => {
  // Create in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Disconnect from any existing connection
  await mongoose.disconnect();
  
  // Connect to in-memory database
  await mongoose.connect(mongoUri);

  // Create admin user
  const admin = new User(adminUser);
  await admin.save();
  
  // Create normal user
  const user = new User(normalUser);
  await user.save();

  // Login as admin
  const adminLoginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: adminUser.email,
      password: adminUser.password
    });
  adminToken = adminLoginResponse.body.token;

  // Login as normal user
  const userLoginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: normalUser.email,
      password: normalUser.password
    });
  userToken = userLoginResponse.body.token;
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Jewelry CRUD Operations', () => {
  // Test creating jewelry (Admin only)
  test('Admin should be able to create jewelry', async () => {
    const response = await request(app)
      .post('/api/jewelry')
      .set('x-auth-token', adminToken)
      .send(testJewelry);

    expect(response.status).toBe(201);
    expect(response.body.name).toBe(testJewelry.name);
    testJewelryId = response.body._id;
  });

  test('Normal user should not be able to create jewelry', async () => {
    const response = await request(app)
      .post('/api/jewelry')
      .set('x-auth-token', userToken)
      .send(testJewelry);

    expect(response.status).toBe(403);
  });

  // Test getting jewelry (All users)
  test('All users should be able to get all jewelry', async () => {
    const response = await request(app)
      .get('/api/jewelry');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('All users should be able to get single jewelry', async () => {
    const response = await request(app)
      .get(`/api/jewelry/${testJewelryId}`);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe(testJewelry.name);
  });

  // Test updating jewelry (Admin only)
  test('Admin should be able to update jewelry', async () => {
    const updateData = {
      price: 149.99,
      stock: 5
    };

    const response = await request(app)
      .put(`/api/jewelry/${testJewelryId}`)
      .set('x-auth-token', adminToken)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.price).toBe(updateData.price);
    expect(response.body.stock).toBe(updateData.stock);
  });

  test('Normal user should not be able to update jewelry', async () => {
    const updateData = {
      price: 199.99
    };

    const response = await request(app)
      .put(`/api/jewelry/${testJewelryId}`)
      .set('x-auth-token', userToken)
      .send(updateData);

    expect(response.status).toBe(403);
  });

  // Test deleting jewelry (Admin only)
  test('Admin should be able to delete jewelry', async () => {
    const response = await request(app)
      .delete(`/api/jewelry/${testJewelryId}`)
      .set('x-auth-token', adminToken);

    expect(response.status).toBe(200);
  });

  test('Normal user should not be able to delete jewelry', async () => {
    const response = await request(app)
      .delete(`/api/jewelry/${testJewelryId}`)
      .set('x-auth-token', userToken);

    expect(response.status).toBe(403);
  });
}); 