const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const connectDB = require('../config/db');

// Create an express app for testing
const app = express();
app.use(cors());
app.use(express.json());

// Basic route for testing
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test API is working' });
});

describe('API Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('should respond to the test endpoint', async () => {
    const response = await request(app).get('/api/test');
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Test API is working');
  });
});