import request from 'supertest';
import App from '../src/app';

describe('API Tests', () => {
  let app: App;

  beforeAll(() => {
    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.PORT = '5001';
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

  describe('Users API', () => {
    it('should get users list', async () => {
      const response = await request(app.app)
        .get('/api/v1/users')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Users retrieved successfully');
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });

    it('should create a new user', async () => {
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
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app.app)
        .get('/api/v1/users/999')
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
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
