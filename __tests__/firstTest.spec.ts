import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import App from '../src/app';
import { prisma } from '../src/config/prisma';

describe('API Integration Tests', () => {
  let app: App;

  beforeAll(async () => {
    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.PORT = '5001';
    process.env.DATABASE_URL = 'file:./test.db';
    app = new App();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app.app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Service is healthy');
      expect(response.body.data.status).toBe('OK');
    });

    it('should return pong', async () => {
      const response = await request(app.app)
        .get('/ping')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Pong!');
      expect(response.body.data.pong).toBe(true);
    });
  });

  describe('Users API with Database', () => {
    it('should get empty users list initially', async () => {
      const response = await request(app.app)
        .get('/api/v1/users')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Users retrieved successfully');
      expect(Array.isArray(response.body.data.data)).toBe(true);
      expect(response.body.data.data).toHaveLength(0);
    });

    it('should create a new user in database', async () => {
      const newUser = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'Test123!',
      };

      const response = await request(app.app)
        .post('/api/v1/users')
        .send(newUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.data.email).toBe(newUser.email);
      expect(response.body.data.name).toBe(newUser.name);
      expect(response.body.data.id).toBeDefined();

      // Verify user was actually created in database
      const user = await prisma.user.findUnique({
        where: { email: newUser.email },
      });
      expect(user).toBeTruthy();
      expect(user?.name).toBe(newUser.name);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app.app)
        .get('/api/v1/users/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });

    it('should prevent duplicate email addresses', async () => {
      // Create first user
      const userData = {
        email: 'duplicate@example.com',
        name: 'First User',
        password: 'Test123!',
      };

      await request(app.app)
        .post('/api/v1/users')
        .send(userData)
        .expect(201);

      // Try to create second user with same email
      const response = await request(app.app)
        .post('/api/v1/users')
        .send({ ...userData, name: 'Second User' })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User with this email already exists');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app.app)
        .get('/api/v1/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Route not found');
    });
  });
});
