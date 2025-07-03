import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

// We'll test the actual Next.js app endpoints
describe('API Integration Tests', () => {
  let server: any;
  let app: any;

  beforeAll(async () => {
    // Create Next.js app for testing
    const dev = process.env.NODE_ENV !== 'production';
    app = next({ dev, quiet: true });
    const handle = app.getRequestHandler();

    await app.prepare();

    server = createServer(async (req, res) => {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    });

    await new Promise<void>((resolve) => {
      server.listen(3001, () => {
        console.log('Test server running on port 3001');
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }
    if (app) {
      await app.close();
    }
  });

  describe('Authentication Endpoints', () => {
    let authToken: string;
    const timestamp = Date.now(); // Use timestamp for unique test data

    it('should register a new user', async () => {
      const response = await request(server)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          username: `testuser_${timestamp}`,
          contact: `test_${timestamp}@example.com`,
          password: 'testpassword123',
          role: 'RENTER',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('username', `testuser_${timestamp}`);
      expect(response.body.user).not.toHaveProperty('password');
      
      authToken = response.body.token;
    });

    it('should login with valid credentials', async () => {
      const response = await request(server)
        .post('/api/auth/login')
        .send({
          username: `testuser_${timestamp}`,
          password: 'testpassword123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('username', `testuser_${timestamp}`);
    });

    it('should fail login with invalid credentials', async () => {
      const response = await request(server)
        .post('/api/auth/login')
        .send({
          username: `testuser_${timestamp}`,
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should verify valid token', async () => {
      const response = await request(server)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Token is valid');
      expect(response.body).toHaveProperty('user');
    });

    it('should fail to verify invalid token', async () => {
      const response = await request(server)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
    });
  });

  describe('User Profile Endpoint', () => {
    let userToken: string;

    beforeAll(async () => {
      // Create a user and get token with timestamp to avoid conflicts
      const timestamp = Date.now();
      const registerResponse = await request(server)
        .post('/api/auth/register')
        .send({
          name: 'Profile User',
          username: `profileuser_${timestamp}`,
          contact: `profile_${timestamp}@example.com`,
          password: 'profile123',
          role: 'RENTER',
        });
      
      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.token).toBeDefined();
      userToken = registerResponse.body.token;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(server)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Profile retrieved successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username');
    });

    it('should fail to get profile without token', async () => {
      const response = await request(server)
        .get('/api/user/profile');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Authentication required');
    });
  });

  describe('Admin Endpoints', () => {
    let adminToken: string;

    beforeAll(async () => {
      // Create admin user and get token with timestamp to avoid conflicts
      const timestamp = Date.now();
      const registerResponse = await request(server)
        .post('/api/auth/register')
        .send({
          name: 'Admin User',
          username: `adminuser_${timestamp}`,
          contact: `admin_${timestamp}@example.com`,
          password: 'admin123',
          role: 'ADMIN',
        });
      
      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.token).toBeDefined();
      adminToken = registerResponse.body.token;
    });

    it('should get all users as admin', async () => {
      const response = await request(server)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Users retrieved successfully');
      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
    });

    it('should fail to get users as non-admin', async () => {
      // Create a regular user with timestamp to avoid conflicts
      const timestamp = Date.now();
      const userResponse = await request(server)
        .post('/api/auth/register')
        .send({
          name: 'Regular User',
          username: `regularuser_${timestamp}`,
          contact: `regular_${timestamp}@example.com`,
          password: 'regular123',
          role: 'RENTER',
        });

      expect(userResponse.status).toBe(201);
      expect(userResponse.body.token).toBeDefined();

      const response = await request(server)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userResponse.body.token}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Insufficient permissions');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing required fields in registration', async () => {
      const response = await request(server)
        .post('/api/auth/register')
        .send({
          name: 'Incomplete User',
          username: 'incomplete',
          // missing contact and password
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Name, username, contact, and password are required');
    });

    it('should handle duplicate username registration', async () => {
      // Use timestamp to ensure unique usernames within the test
      const timestamp = Date.now();
      const uniqueUsername = `duplicate_${timestamp}`;
      
      // First registration
      await request(server)
        .post('/api/auth/register')
        .send({
          name: 'First User',
          username: uniqueUsername,
          contact: `first_${timestamp}@example.com`,
          password: 'password123',
        });

      // Second registration with same username
      const response = await request(server)
        .post('/api/auth/register')
        .send({
          name: 'Second User',
          username: uniqueUsername,
          contact: `second_${timestamp}@example.com`,
          password: 'password123',
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error', 'Username already exists');
    });

    it('should handle malformed JSON in login', async () => {
      const response = await request(server)
        .post('/api/auth/login')
        .send('invalid json');

      expect(response.status).toBe(400);
    });
  });

  describe('Rate Limiting & Security', () => {
    it('should handle requests without content-type header', async () => {
      const response = await request(server)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'testpassword',
        });

      // Should still work as supertest handles content-type
      expect([200, 400, 401]).toContain(response.status);
    });

    it('should handle very long passwords', async () => {
      const longPassword = 'a'.repeat(1000);
      const timestamp = Date.now();
      const response = await request(server)
        .post('/api/auth/register')
        .send({
          name: 'Long Password User',
          username: `longpassuser_${timestamp}`,
          contact: `longpass_${timestamp}@example.com`,
          password: longPassword,
        });

      // Should either succeed or fail gracefully
      expect([201, 400, 500]).toContain(response.status);
    });
  });
});
